import { LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { readFileSync } from 'fs';
import { CoscradBulkImportJobCreateDto } from '../app/controllers/command/bulk-imports/bulk-import-job.create-dto.entity';
import {
    COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
    CommandExecutionService,
} from '../app/controllers/command/command-execution.service';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import {
    CreateAudioItem,
    TranslateAudioItemName,
} from '../domain/models/audio-visual/audio-item/commands';
import { CreateMediaItem } from '../domain/models/media-item/commands';
import { GrantUserRole } from '../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { RegisterUser } from '../domain/models/user-management/user/commands/register-user/register-user.command';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateType } from '../domain/types/AggregateType';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

type CommandFsa = {
    type: string;
    payload: {
        aggregateCompositeIdentifier: {
            id: string;
            type: string;
        };
    };
};

type CommandFsaWithMeta = CommandFsa & {
    meta?: Record<string, unknown>;
};

type DataFilenameAndCommandStream = {
    filename: string;
    stream: CommandFsaWithMeta[];
};

const GENERATE_THIS_ID = 'GENERATE_THIS_ID';

const APPEND_THIS_ID = 'APPEND_THIS_ID';

const createAdminUserCommand: RegisterUser = {
    aggregateCompositeIdentifier: {
        type: AggregateType.user,
        id: `${GENERATE_THIS_ID}:1`,
    },
    userIdFromAuthProvider: 'auth0|6407b7bd81d69faf23e9dd7e',
    username: 'Cypress McTester',
};

const createAdminUserCommandFsa = {
    type: 'REGISTER_USER',
    payload: createAdminUserCommand,
};

const grantUserRoleCommand: GrantUserRole = {
    aggregateCompositeIdentifier: {
        type: AggregateType.user,
        id: `${APPEND_THIS_ID}:1`,
    },
    role: CoscradUserRole.projectAdmin,
};

const grantUserRoleCommandFsa = {
    type: 'GRANT_USER_ROLE',
    payload: grantUserRoleCommand,
};

const createMediaItem: CreateMediaItem = {
    aggregateCompositeIdentifier: {
        type: AggregateType.mediaItem,
        id: `${GENERATE_THIS_ID}:2`,
    },
    title: 'the media item for my song',
    mimeType: MIMEType.mp3,
};

const createAudioItem: CreateAudioItem = {
    aggregateCompositeIdentifier: {
        type: AggregateType.audioItem,
        id: `${GENERATE_THIS_ID}:1`,
    },
    name: 'my song',
    languageCodeForName: LanguageCode.English,
    mediaItemId: `${APPEND_THIS_ID}:2`,
    lengthMilliseconds: 1234,
};

const translateAudioItemName: TranslateAudioItemName = {
    aggregateCompositeIdentifier: {
        type: AggregateType.audioItem,
        id: `${APPEND_THIS_ID}:1`,
    },
    text: 'my song (clc)',
    languageCode: LanguageCode.Chilcotin,
};

const audioItemWithTranslationCommandFsaStream = [
    {
        type: 'CREATE_MEDIA_ITEM',
        payload: createMediaItem,
    },
    {
        type: 'CREATE_AUDIO_ITEM',
        payload: createAudioItem,
    },
    {
        type: 'TRANSLATE_AUDIO_ITEM_NAME',
        payload: translateAudioItemName,
    },
];

/**
 * Note: Add Geoff's test user
 * TODO: Find a cleaner way of seeding multiple test users in the database
 */

const createGeoffUserCommand: RegisterUser = {
    aggregateCompositeIdentifier: {
        type: AggregateType.user,
        id: `${GENERATE_THIS_ID}:2`,
    },
    userIdFromAuthProvider: 'auth0|65a56f7af6a935f20eb4b7f5',
    username: 'Geoff Test User',
};

const createGeoffUserCommandFsa = {
    type: 'REGISTER_USER',
    payload: createGeoffUserCommand,
};

const grantGeoffUserRoleCommand: GrantUserRole = {
    aggregateCompositeIdentifier: {
        type: AggregateType.user,
        id: `${APPEND_THIS_ID}:2`,
    },
    role: CoscradUserRole.projectAdmin,
};

const grantGeoffUserRoleCommandFsa = {
    type: 'GRANT_USER_ROLE',
    payload: grantGeoffUserRoleCommand,
};

const createAdminUserCommandStream = [
    createAdminUserCommandFsa,
    grantUserRoleCommandFsa,
    createGeoffUserCommandFsa,
    grantGeoffUserRoleCommandFsa,
];

interface ExecuteCommandStreamCliCommandOptions {
    name: CommandFsaWithMeta[];
    dataFile: DataFilenameAndCommandStream;
    now: boolean;
}

@CliCommand({
    name: 'execute-command-stream',
    description: 'executes one or more command FSAs in sequence',
})
export class ExecuteCommandStreamCliCommand extends CliCommandRunner {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        private readonly commandExecutor: CommandExecutionService,
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    /**
     * TODO Move the slug generation logic into a separate service.
     */
    async run(
        _passedParams: string[],
        {
            name: commandFsasFromFixture,
            dataFile: dataFilenamesAndCommandFsas,
            now: shouldExecuteNow,
        }: ExecuteCommandStreamCliCommandOptions
    ): Promise<void> {
        // console.time('command-performance');

        if (dataFilenamesAndCommandFsas && commandFsasFromFixture) {
            const msg = `You must only specify one of [name, data-file]`;

            this.logger.log(msg);

            this.logger.log(`exiting.`);

            throw new InternalError(msg);
        }

        if (!dataFilenamesAndCommandFsas && !commandFsasFromFixture) {
            const msg = `You must specify exactly one of [name, data-file]`;

            this.logger.log(msg);

            this.logger.log(`Exiting.`);

            throw new InternalError(msg);
        }

        const resolvedCommandFsasFromParams =
            commandFsasFromFixture || dataFilenamesAndCommandFsas.stream;

        const slugGenerationResult = await this.commandExecutor.acquireIdsForSlugsOnStream(
            // @ts-expect-error TODO fix this type issue
            resolvedCommandFsasFromParams
        );

        if (isInternalError(slugGenerationResult)) {
            this.logger.log(slugGenerationResult.toString());

            throw slugGenerationResult;
        }

        const { updatedStream: commandFsasToExecute } = slugGenerationResult;

        const typeValidationResult =
            this.commandExecutor.validateCommandStream(commandFsasToExecute);

        if (isInternalError(typeValidationResult)) {
            throw new InternalError(
                `Failed to create bulk job. One or more commands was invalidly formatted`
            );
        }

        const failures = typeValidationResult.flatMap(({ result }) =>
            result === COMMAND_ACKNOWLEDGEMENT_BODY_TEXT ? [] : [new InternalError(result)]
        );

        // TODO return an instance with this method from the validation service
        if (failures.length > 0) {
            throw new InternalError(
                `Failed to create bulk job. One or more commands has failed schema validation.`
            );
        }

        const bulkJob: CoscradBulkImportJobCreateDto = {
            name: commandFsasFromFixture
                ? `execute-command-stream [${Date.now()}]`
                : dataFilenamesAndCommandFsas.filename,
            stream: commandFsasToExecute,
        };

        const jobId = await this.commandExecutor.createBulkJob(bulkJob).catch((e) => {
            throw new InternalError(
                `Failed to create bulk job for command stream execution in CLI`,
                [new InternalError(e?.message || 'unknown reason')]
            );
        });

        if (isInternalError(jobId)) {
            throw new InternalError(`Failed to create bulk job for command execution via CLI`, [
                jobId,
            ]);
        }

        // TODO log successful job creation

        if (shouldExecuteNow) {
            const commandResults = await this.commandExecutor.executeBulkJob(
                new CoscradUserWithGroups(
                    new CoscradUser({
                        type: AggregateType.user,
                        username: 'coscrad-admin',
                        id: 'COSCRAD_ADMIN',
                        authProviderUserId: '',

                        roles: [CoscradUserRole.superAdmin],
                        profile: {
                            name: {
                                firstName: 'CLI',
                                lastName: 'User',
                            },
                            email: 'cli-user@cosrad.org',
                        },
                    }),
                    []
                ),
                jobId
            );

            if (isInternalError(commandResults)) {
                throw new InternalError(`Invalidly formatted request for bulk job execution`, [
                    commandResults,
                ]);
            }

            const failures = commandResults.filter(
                ({ result }) => result !== COMMAND_ACKNOWLEDGEMENT_BODY_TEXT
            );

            const wasSuccess = failures.length === 0;

            if (!wasSuccess) {
                this.logger.log(`One or more commands failed. \n ${JSON.stringify(failures)}`);

                throw new Error(`Bulk command execution completed but with errors`);
            }

            this.logger.log(`Success`);
        }
    }

    @CliCommandOption({
        flags: '--name [fixture-name]',
        description: 'the name of the fixture command stream to run',
        required: false,
    })
    parseFixtureName(value: string): CommandFsa[] {
        if (!isNonEmptyString(value)) return undefined;

        if (value == 'audio:with-translation') {
            return audioItemWithTranslationCommandFsaStream;
        }

        if (value == 'users:create-admin') {
            return createAdminUserCommandStream;
        }

        throw new Error(`unrecognized command stream fixture name: ${value}`);
    }

    @CliCommandOption({
        flags: '--data-file [data-file]',
        description: 'path to the (local) JSON data file with an array of command FSAs',
        required: false,
    })
    parseDataFile(value: string): DataFilenameAndCommandStream {
        if (!isNonEmptyString(value)) return undefined;

        try {
            const parsedCommandFsaStream = JSON.parse(
                readFileSync(value, { encoding: 'utf-8' })
            ) as CommandFsaWithMeta[];

            return { filename: value, stream: parsedCommandFsaStream };
        } catch (error) {
            const customError = new InternalError(
                `Failed to parse command stream from JSON file`,
                error?.message ? [new InternalError(error.message)] : []
            );

            this.logger.log(customError.toString());

            throw customError;
        }
    }

    @CliCommandOption({
        flags: '-n, --now [now]',
        description: 'when set, executes the bulk job immediately',
        required: false,
    })
    parseNow(value: string): boolean {
        return JSON.parse(value);
    }
}
