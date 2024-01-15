import { CommandHandlerService } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { GrantUserRole } from '../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { RegisterUser } from '../domain/models/user-management/user/commands/register-user/register-user.command';
import { AggregateId } from '../domain/types/AggregateId';
import { AggregateType } from '../domain/types/AggregateType';
import { InternalError } from '../lib/errors/InternalError';
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

type CommandResult = {
    index: number;
    fsa: CommandFsa;
    errors: string[];
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

@CliCommand({
    name: 'execute-command-stream',
    description: 'executes one or more command FSAs in sequence',
})
export class ExecuteCommandStreamCliCommand extends CliCommandRunner {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    /**
     * TODO Move this logic into a service we can reuse. Maybe CommandHandlerService.executeStream()
     */
    async run(
        _passedParams: string[],
        {
            name: commandFsasFromFixture,
            dataFile: commandFsasFromDataFile,
        }: { name: CommandFsa[]; dataFile: CommandFsa[] }
    ): Promise<void> {
        if (commandFsasFromDataFile && commandFsasFromFixture) {
            const msg = `You must only specify one of [name, data-file]`;

            this.logger.log(msg);

            this.logger.log(`exiting.`);

            throw new InternalError(msg);
        }

        if (!commandFsasFromDataFile && !commandFsasFromFixture) {
            const msg = `You must specify exactly one of [name, data-file]`;

            this.logger.log(msg);

            this.logger.log(`Exiting.`);

            throw new InternalError(msg);
        }

        const commandFsasToExecute = commandFsasFromDataFile || commandFsasFromFixture;

        const commandResults: CommandResult[] = [];

        const userDefinedSlugs = commandFsasToExecute
            .map(
                ({
                    payload: {
                        aggregateCompositeIdentifier: { id },
                    },
                }) => id
            )
            .filter((id) => id.includes(GENERATE_THIS_ID))
            .map((slugWithPrefix) => {
                const splitOnColon = slugWithPrefix.split(':');

                if (splitOnColon.length !== 2) {
                    throw new InternalError(
                        `encountered an invalid slug definition: ${slugWithPrefix}`
                    );
                }

                return splitOnColon[1];
            });

        const generatedIds = await this.idManager.generateMany(userDefinedSlugs.length);

        const idMap = generatedIds.reduce((acc, generatedId, index) => {
            // We essentially zipping the slugs together with corresponding uuids
            const slug = userDefinedSlugs[index];

            // TODO: do we want to throw here?
            if (acc.has(slug)) return acc;

            return acc.set(slug, generatedId);
        }, new Map<string, AggregateId>());

        for (const [index, fsa] of commandFsasToExecute.entries()) {
            /**
             * Note that we need a more sophisticated way to deal with generating
             * and appending aggregate context in bulk execution.
             */

            // TODO: use clone utility

            const {
                payload: {
                    aggregateCompositeIdentifier: { id: idOnPayload },
                },
            } = fsa;

            const idToUse = [GENERATE_THIS_ID, APPEND_THIS_ID].some((prefix) =>
                idOnPayload.includes(prefix)
            )
                ? idMap.get(idOnPayload.split(':')[1])
                : idOnPayload;

            const fsaToExecute = {
                ...fsa,
                payload: {
                    ...fsa.payload,
                    aggregateCompositeIdentifier: {
                        ...fsa.payload.aggregateCompositeIdentifier,
                        // Note that we assume the entire command stream targets the same aggregate root
                        id: idToUse,
                    },
                },
            };

            this.logger.log(`Attempting to execute command FSA: ${JSON.stringify(fsaToExecute)}`);

            const commandResult = await this.commandHandlerService.execute(fsaToExecute, {
                userId: 'COSCRAD Admin',
            });

            commandResults.push({
                index,
                fsa,
                errors: commandResult instanceof Error ? [commandResult.toString()] : [],
            });
        }

        const failures = commandResults.filter(({ errors }) => errors.length > 0);

        const wasSuccess = failures.length === 0;

        if (!wasSuccess) {
            this.logger.log(`One or more commands failed. \n ${JSON.stringify(failures)}`);

            throw new Error(`Bulk command execution completed but with errors`);
        }

        this.logger.log(`Success`);
    }

    @CliCommandOption({
        flags: '--name [fixture-name]',
        description: 'the name of the fixture command stream to run',
        required: false,
    })
    parseFixtureName(value: string): CommandFsa[] {
        if (!isNonEmptyString(value)) return undefined;

        if (value !== 'users:create-admin') {
            throw new Error(`unrecognized command stream fixture name: ${value}`);
        }

        return createAdminUserCommandStream;
    }

    @CliCommandOption({
        flags: '--data-file [data-file]',
        description: 'path to the (local) JSON data file with an array of command FSAs',
        required: false,
    })
    parseDataFile(value: string): CommandFsa[] {
        if (!isNonEmptyString(value)) return undefined;

        try {
            const parsedCommandFsaStream = JSON.parse(readFileSync(value, { encoding: 'utf-8' }));

            return parsedCommandFsaStream;
        } catch (error) {
            const customError = new InternalError(
                `Failed to parse command stream from JSON file`,
                error?.message ? [new InternalError(error.message)] : []
            );

            this.logger.log(customError.toString());

            throw customError;
        }
    }
}
