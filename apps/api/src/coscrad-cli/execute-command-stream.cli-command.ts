import { CommandHandlerService } from '@coscrad/commands';
import {
    COMPOSITE_IDENTIFIER,
    CoscradUserRole,
    getCoscradDataSchema,
    getReferencesForCoscradDataSchema,
} from '@coscrad/data-types';
import { isNonEmptyString, isString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { GrantUserRole } from '../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { RegisterUser } from '../domain/models/user-management/user/commands/register-user/register-user.command';
import { ImportEntriesToVocabularyList } from '../domain/models/vocabulary-list/commands';
import { AggregateId } from '../domain/types/AggregateId';
import { AggregateType } from '../domain/types/AggregateType';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { Ctor } from '../lib/types/Ctor';
import { clonePlainObjectWithOverrides } from '../lib/utilities/clonePlainObjectWithOverrides';
import { cloneWithOverridesByDeepPath } from '../lib/utilities/cloneWithOverridesByDeepPath';
import { getDeepPropertyFromObject } from '../lib/utilities/getDeepPropertyFromObject';
import { ResultOrError } from '../types/ResultOrError';
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

type CommandResult = {
    index: number;
    fsa: CommandFsa;
    errors: string[];
};

const GENERATE_THIS_ID = 'GENERATE_THIS_ID';

const APPEND_THIS_ID = 'APPEND_THIS_ID';

type SlugContext = typeof GENERATE_THIS_ID | typeof APPEND_THIS_ID;

const isSlugContext = (input: unknown): input is SlugContext =>
    isString(input) && [GENERATE_THIS_ID, APPEND_THIS_ID].includes(input);

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

const parseSlugDefinition = (
    input: string
): ResultOrError<[typeof GENERATE_THIS_ID | typeof APPEND_THIS_ID, string]> => {
    const DELIMITER = ':';

    const splitOnDelimeter = input.split(DELIMITER);

    const buildErrorMessage = (input: string, problem: string) =>
        `Encountered an invalid slug definition [${problem}]: {${input}}`;

    if (splitOnDelimeter.length !== 2) {
        return new InternalError(buildErrorMessage(input, `missing colon (:)`));
    }

    const [prefix, slug] = splitOnDelimeter;

    // This would happen if the input were `id: "9:GENERATE_THIS_ID"`, for example
    if (isSlugContext(slug)) {
        return new InternalError(
            buildErrorMessage(input, `${GENERATE_THIS_ID} | ${APPEND_THIS_ID} must come first`)
        );
    }

    if (!isSlugContext(prefix)) {
        return new InternalError(
            buildErrorMessage(
                input,
                `invalid slug context (must be ${GENERATE_THIS_ID} | ${APPEND_THIS_ID})`
            )
        );
    }

    return [prefix, slug];
};

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
        }: { name: CommandFsaWithMeta[]; dataFile: CommandFsaWithMeta[] }
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

        const userDefinedSlugParseResult = commandFsasToExecute
            .map(
                ({
                    payload: {
                        aggregateCompositeIdentifier: { id },
                    },
                }) => id
            )
            .map((slugFromPayload) => {
                return parseSlugDefinition(slugFromPayload);
            });

        const invalidSlugDefinitions = userDefinedSlugParseResult.filter(isInternalError);

        if (invalidSlugDefinitions.length > 0) {
            const exception = new InternalError(
                `Encountered invalid command stream definition`,
                invalidSlugDefinitions
            );

            this.logger.log(exception.toString());

            throw exception;
        }

        const userDefinedSlugs = (userDefinedSlugParseResult as [SlugContext, string][])
            .filter(([slugContext, _]) => slugContext === GENERATE_THIS_ID)
            .map(([_slugContext, slug]) => slug);

        const generatedIds = await this.idManager.generateMany(userDefinedSlugs.length);

        const idMap = generatedIds.reduce((acc, generatedId, index) => {
            // We essentially zipping the slugs together with corresponding uuids
            const slug = userDefinedSlugs[index];

            // TODO: do we want to throw here?
            if (acc.has(slug)) return acc;

            return acc.set(slug, generatedId);
        }, new Map<string, AggregateId>());

        const commandCtorsAndMeta = this.commandHandlerService.getAllCommandCtorsAndMetadata();

        const commandTypeToCtor = commandCtorsAndMeta.reduce(
            (acc: Map<string, Ctor<unknown>>, { meta: { type }, constructor }) =>
                acc.set(type, constructor),
            new Map<string, Ctor<unknown>>()
        );

        const commandTypeToReferentialPropertyPaths = commandFsasToExecute.reduce(
            (acc, { type }) => {
                if (acc.has(type)) {
                    return acc;
                }

                if (!commandTypeToCtor.has(type)) {
                    throw new InternalError(
                        `Failed to find a constructor for command of type: ${type}`
                    );
                }

                const ctor = commandTypeToCtor.get(type);

                const referenceSpecifications = getReferencesForCoscradDataSchema(
                    getCoscradDataSchema(ctor)
                );

                const referencePropertyPaths = referenceSpecifications.map(
                    // If the reference is a full composite identifier, we need to access the nested ID property
                    ({ type, path }) => {
                        const nestedPath = type === COMPOSITE_IDENTIFIER ? `${path}.id` : path;

                        // note that the COSCRAD Schema is for the payload, which is itself a nested FSA property
                        return `payload.${nestedPath}`;
                    }
                );

                return acc.set(type, referencePropertyPaths);
            },
            new Map<string, string[]>()
        );

        for (const [index, fsa] of commandFsasToExecute.entries()) {
            const {
                type: commandType,
                payload: {
                    aggregateCompositeIdentifier: { id: idOnPayload },
                },
            } = fsa;

            const customIdParseResult = parseSlugDefinition(idOnPayload);

            /**
             * If parse fails, we take it to mean that the user has provided a
             * standard UUID on the payload. If not, the command will fail for
             * other reasons upstream.
             */
            const idToUse = isInternalError(customIdParseResult)
                ? idOnPayload
                : // look up the UUID corresponding to this slug
                  idMap.get(customIdParseResult[1]);

            let fsaToExecute = clonePlainObjectWithOverrides(fsa, {
                payload: {
                    aggregateCompositeIdentifier: {
                        id: idToUse,
                    },
                },
            });

            if (commandTypeToReferentialPropertyPaths.has(commandType)) {
                commandTypeToReferentialPropertyPaths.get(commandType).forEach((fullPath) => {
                    const value = getDeepPropertyFromObject(fsaToExecute, fullPath);

                    if (Array.isArray(value)) {
                        if (commandType !== 'IMPORT_ENTRIES_TO_VOCABULARY_LIST') {
                            throw new InternalError(
                                `Using slugs for arrays of references is not yet supported`
                            );
                        }

                        const { entries } = fsa.payload as ImportEntriesToVocabularyList;

                        const entriesWithSlugsReplaced = entries.map((entry) => {
                            const customIdParseResult = parseSlugDefinition(entry.termId);

                            if (isInternalError(customIdParseResult)) {
                                throw new InternalError(
                                    `Failed to parse custom slug on nested array for IMPORT_ENTRIES_TO_VOCABULARY_LIST`,
                                    [customIdParseResult]
                                );
                            }

                            const termIdToUse = idMap.get(customIdParseResult[1]);

                            return {
                                ...entry,
                                termId: termIdToUse,
                            };
                        });

                        fsaToExecute = cloneWithOverridesByDeepPath(
                            fsaToExecute,
                            'payload.entries',
                            entriesWithSlugsReplaced
                        );
                    }

                    if (isString(value) && value.includes(APPEND_THIS_ID)) {
                        const customIdParseResult = parseSlugDefinition(value);

                        const referenceIdToUse = isInternalError(customIdParseResult)
                            ? idOnPayload
                            : // look up the UUID corresponding to this slug
                              idMap.get(customIdParseResult[1]);

                        fsaToExecute = cloneWithOverridesByDeepPath(
                            fsaToExecute,
                            fullPath,
                            referenceIdToUse
                        );
                    }

                    console.log(fsaToExecute);
                });
            }

            this.logger.log(`Attempting to execute command FSA: ${JSON.stringify(fsaToExecute)}`);

            const contributorIds = fsaToExecute?.meta?.contributorIds || [];

            const commandResult = await this.commandHandlerService.execute(fsaToExecute, {
                userId: 'COSCRAD Admin',
                /**
                 * This allows the user to inject `contributorIds`. We do not
                 * want the user to override timestamps, though.
                 */
                contributorIds,
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
    parseDataFile(value: string): CommandFsaWithMeta[] {
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
