import { ICommandBase } from '@coscrad/api-interfaces';
import { Ack, CommandHandlerService, CommandStreamExecutionResult } from '@coscrad/commands';
import {
    COMPOSITE_IDENTIFIER,
    getCoscradDataSchema,
    getReferencesForCoscradDataSchema,
} from '@coscrad/data-types';
import {
    isNonEmptyObject,
    isNonEmptyString,
    isNullOrUndefined,
    isString,
    isUUID,
} from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { Ctor } from '../../../../src/lib/types/Ctor';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
    UniquelyIdentifiableType,
} from '../../../domain/interfaces/id-manager.interface';
import {
    ConnectResourcesWithNote,
    CreateNoteAboutResource,
} from '../../../domain/models/context/commands';
import validateCommandPayloadType from '../../../domain/models/shared/command-handlers/utilities/validateCommandPayloadType';
import CommandExecutionError from '../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { ImportEntriesToVocabularyList } from '../../../domain/models/vocabulary-list/commands';
import { AggregateId } from '../../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import { cloneWithOverridesByDeepPath } from '../../../lib/utilities/cloneWithOverridesByDeepPath';
import { getDeepPropertyFromObject } from '../../../lib/utilities/getDeepPropertyFromObject';
import { DeepPartial } from '../../../types/DeepPartial';
import { ResultOrError } from '../../../types/ResultOrError';
import { CoscradBulkImportJobCreateDto } from './bulk-imports/bulk-import-job.create-dto.entity';
import { CoscradBulkImportJob } from './bulk-imports/bulk-import-job.entity';
import {
    BULK_JOB_REPOSITORY_INJECTION_TOKEN,
    IBulkJobRepository,
} from './bulk-imports/bulk-job-repository.interface';
import { CommandFSA } from './command-fsa/command-fsa.entity';

export const COMMAND_ACKNOWLEDGEMENT_BODY_TEXT = 'ACK';

type CommandStreamExecutionPersistenceRecord = Pick<CommandStreamExecutionResult, 'fsa'> & {
    result: typeof COMMAND_ACKNOWLEDGEMENT_BODY_TEXT | string;
};

/**
 * This is a hack. A more robust design would be to use an object-valued slug
 * definition where a UUID is expected on the incoming payload, e.g.
 * ```json
 * {
 *     "aggregateCompositeIdentifier": {
 *          "type": "term",
 *          "id": {
 *              "type": "slug",
 *              "value": "123"
 *          }
 *      }
 * }
 * ```
 * Not much else changes from this point.
 */
const GENERATE_THIS_ID = 'GENERATE_THIS_ID';

const APPEND_THIS_ID = 'APPEND_THIS_ID';

type SlugContext = typeof GENERATE_THIS_ID | typeof APPEND_THIS_ID;

const isSlugContext = (input: unknown): input is SlugContext =>
    isString(input) && [GENERATE_THIS_ID, APPEND_THIS_ID].includes(input);

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

// BulkJob Manager?
export class CommandExecutionService {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(BULK_JOB_REPOSITORY_INJECTION_TOKEN)
        private readonly bulkJobRepo: IBulkJobRepository,
        @Inject(ID_MANAGER_TOKEN)
        private readonly idManager: IIdManager
    ) {}
    async executeCommand(
        user: CoscradUserWithGroups,
        { type, payload, meta }: CommandFSA
    ): Promise<Ack | Error> {
        const result = await this.commandHandlerService.execute(
            { type, payload },
            {
                ...meta,
                userId: user.id,
            }
        );

        return result instanceof Error
            ? new CommandExecutionError([new InternalError(result.message)])
            : result;
    }

    async createBulkJob(
        createDto: CoscradBulkImportJobCreateDto
    ): Promise<ResultOrError<AggregateId>> {
        // TODO invariant validation

        const newId = await this.idManager.generate();

        const instanceOrError = CoscradBulkImportJob.fromCreateDto({ ...createDto, id: newId });

        if (isInternalError(instanceOrError)) {
            return instanceOrError;
        }

        /**
         * TODO consider wrapping the next 2 repo calls in a transaction. Without
         * doing this, we choose to mark the ID as used as it's better to have
         * an ID that is unavailable but not actually in use than an entity
         * with an ID that is still available. That said, within the normal
         * flow of the situation, UUIDs will be impossible to reuse, but with
         * manual service \ API calls, this situation could be created.
         */
        // TODO Will we track the bulk job as an aggregate root? Maybe we don't need it on the big enum, which is being phased out.
        await this.idManager.use({ type: 'bulkJob' as UniquelyIdentifiableType, id: newId });

        const result = await this.bulkJobRepo.create(instanceOrError);

        return result;
    }

    async fetchBulkJobById(jobId: AggregateId): Promise<Maybe<CoscradBulkImportJob>> {
        return this.bulkJobRepo.fetchById(jobId);
    }

    async fetchManyBulkJobs(): Promise<CoscradBulkImportJob[]> {
        return this.bulkJobRepo.fetchMany();
    }

    async executeBulkJob(
        user: CoscradUserWithGroups,
        id: string
    ): Promise<ResultOrError<CommandStreamExecutionPersistenceRecord[]>> {
        const fetchResult = await this.bulkJobRepo.fetchById(id);

        if (isNotFound(fetchResult)) {
            return new InternalError(`There is no bulk job with the ID: ${id}`);
        }

        if (!fetchResult.isDraft()) {
            return new InternalError(
                `You cannot execute bulk job: ${id} as it has already been initiated`
            );
        }

        const { stream: commandStream } = fetchResult;

        // TODO[test-coverage] validate that additional meta comes through at the integration level (we have e2e tests of this)
        const resultsForAllCommands = await this.commandHandlerService.executeStream(
            commandStream.map(({ type, payload, meta }) => ({
                type,
                payload,
                meta: {
                    userId: user.id,
                    contributorIds: meta?.contributorIds || [],
                },
            }))
        );

        const results = this.transformResults(resultsForAllCommands);

        // @ts-expect-error We are experiencing some friction with inconsistent `CommandFsa` type definitions
        await this.bulkJobRepo.registerResults(id, results, Date.now());

        return results;
    }

    validateCommandStream(
        commandStream: CommandFSA[]
    ): ResultOrError<CommandStreamExecutionPersistenceRecord[]> {
        if (!(commandStream.length > 0)) {
            return new InternalError(`You must provide at least one command FSA to validate`);
        }

        // @ts-expect-error TODO fix this
        const validationResults: CommandStreamExecutionResult[] = commandStream.map(
            (fsa, index) => {
                // TODO use schema validation for this
                if (!isNonEmptyString(fsa.type)) {
                    return {
                        fsa,
                        result: new InternalError(
                            `You must specify the type of command to execute`
                        ),
                    };
                }

                // TODO allow both payload and type errors to come through for easier troubleshooting
                if (!isNonEmptyObject(fsa.payload)) {
                    return {
                        fsa,
                        result: new InternalError(
                            `You must provide a payload for ${fsa.type ? fsa.type : 'this command'}`
                        ),
                    };
                }

                const commandBuildResult = this.commandHandlerService.buildCommandInstance(fsa);

                const result =
                    // be careful, the command handler service does not package errors inside of `InternalError`
                    commandBuildResult instanceof Error
                        ? new InternalError(
                              `Encountered an invalid command stream at index [${index}]`,
                              [new InternalError(commandBuildResult.message)]
                          )
                        : validateCommandPayloadType(commandBuildResult, fsa.type);

                return {
                    fsa,
                    result,
                };
            }
        );

        return this.transformResults(validationResults);
    }

    /**
     * Note that this logic is currently tested at a higher level in
     * `execute-command-stream.cli-command.e2e.spec.ts`.
     */
    async acquireIdsForSlugsOnStream<T extends CommandFSA<ICommandBase>>(
        commandFsas: T[]
    ): Promise<
        ResultOrError<{
            slugToUuid: Map<string, string>;
            updatedStream: CommandFSA[];
        }>
    > {
        const userDefinedSlugParseResult = commandFsas
            .map(
                ({
                    payload: {
                        aggregateCompositeIdentifier: { id },
                    },
                }) => id
            )
            .map((idFromPayload) => {
                return isUUID(idFromPayload) ? idFromPayload : parseSlugDefinition(idFromPayload);
            });

        const invalidSlugDefinitions = userDefinedSlugParseResult.filter(isInternalError);

        if (invalidSlugDefinitions.length > 0) {
            return new InternalError(
                `Encountered invalid command stream definition`,
                invalidSlugDefinitions
            );
        }

        const userDefinedSlugs = (userDefinedSlugParseResult as [SlugContext, string][])
            .filter(([slugContext, _]) => slugContext === GENERATE_THIS_ID)
            .map(([_slugContext, slug]) => slug);

        const generatedIds = await this.idManager.generateMany(userDefinedSlugs.length);

        const slugToUuid = generatedIds.reduce((acc, generatedId, index) => {
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

        const commandTypeToReferentialPropertyPaths = commandFsas.reduce((acc, { type }) => {
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
        }, new Map<string, string[]>());

        const commandFsasToExecute = [];

        for (const fsa of commandFsas) {
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
                  slugToUuid.get(customIdParseResult[1]);

            let fsaToExecute = clonePlainObjectWithOverrides(fsa, {
                payload: {
                    aggregateCompositeIdentifier: {
                        id: idToUse,
                    },
                },
            } as unknown as DeepPartial<T>);

            if (fsa.type === 'IMPORT_ENTRIES_TO_VOCABULARY_LIST') {
                const newEntries = (
                    fsaToExecute.payload as ImportEntriesToVocabularyList
                ).entries.map((entry) => {
                    if (
                        ![APPEND_THIS_ID, GENERATE_THIS_ID].some((prefix) =>
                            entry.termId.includes(prefix)
                        )
                    ) {
                        // nothing to do here
                        return entry;
                    }

                    const customIdParseResult = parseSlugDefinition(entry.termId);

                    const referenceIdToUse = isInternalError(customIdParseResult)
                        ? idOnPayload
                        : // look up the UUID corresponding to this slug
                          slugToUuid.get(customIdParseResult[1]);

                    return {
                        propertyValues: entry.propertyValues,
                        termId: referenceIdToUse,
                    };
                });

                fsaToExecute = cloneWithOverridesByDeepPath(
                    fsaToExecute,
                    // payload.entries
                    'payload.entries',
                    newEntries
                );
            } else if (fsa.type === 'CONNECT_RESOURCES_WITH_NOTE') {
                const payload = fsa.payload as ConnectResourcesWithNote;

                const fromSlugDefinition = parseSlugDefinition(
                    payload.fromMemberCompositeIdentifier.id
                );

                if (!isInternalError(fromSlugDefinition)) {
                    fsaToExecute = cloneWithOverridesByDeepPath(
                        fsaToExecute,
                        'payload.fromMemberCompositeIdentifier.id',
                        slugToUuid.get(fromSlugDefinition[1])
                    );
                }

                const toSlugDefinition = parseSlugDefinition(
                    payload.toMemberCompositeIdentifier.id
                );

                if (!isInternalError(toSlugDefinition)) {
                    fsaToExecute = cloneWithOverridesByDeepPath(
                        fsaToExecute,
                        'payload.toMemberCompositeIdentifier.id',
                        slugToUuid.get(toSlugDefinition[1])
                    );
                }
            } else if (fsa.type === 'CREATE_NOTE_ABOUT_RESOURCE') {
                const payload = fsa.payload as CreateNoteAboutResource;

                const selfMemberSlugDefinition = parseSlugDefinition(
                    payload.resourceCompositeIdentifier.id
                );

                if (!isInternalError(selfMemberSlugDefinition)) {
                    fsaToExecute = cloneWithOverridesByDeepPath(
                        fsaToExecute,
                        'payload.resourceCompositeIdentifier.id',
                        slugToUuid.get(selfMemberSlugDefinition[1])
                    );
                }
            } else if (commandTypeToReferentialPropertyPaths.has(commandType)) {
                commandTypeToReferentialPropertyPaths.get(commandType).forEach((fullPath) => {
                    const value = getDeepPropertyFromObject(fsaToExecute, fullPath);

                    if (
                        Array.isArray(value) &&
                        [APPEND_THIS_ID, GENERATE_THIS_ID].some((prefix) => value.includes(prefix))
                    ) {
                        /**
                         * This is a major hack. We need to find a better way
                         * to deal with joining in slug references in general.
                         */
                        if (!['IMPORT_ENTRIES_TO_VOCABULARY_LIST'].includes(fsa.type)) {
                            throw new InternalError(
                                `Using slugs for arrays of references is not yet supported. Found array with references: ${
                                    isNullOrUndefined(value) ? '' : JSON.stringify(value)
                                } on command FSA: ${JSON.stringify(fsaToExecute)}`
                            );
                        }
                    }

                    if (isString(value) && value.includes(APPEND_THIS_ID)) {
                        const customIdParseResult = parseSlugDefinition(value);

                        const referenceIdToUse = isInternalError(customIdParseResult)
                            ? idOnPayload
                            : // look up the UUID corresponding to this slug
                              slugToUuid.get(customIdParseResult[1]);

                        fsaToExecute = cloneWithOverridesByDeepPath(
                            fsaToExecute,
                            fullPath,
                            referenceIdToUse
                        );
                    }
                });
            }

            commandFsasToExecute.push(fsaToExecute);
        }

        return {
            slugToUuid,
            updatedStream: commandFsasToExecute,
        };
    }

    private transformResults(
        results: CommandStreamExecutionResult[]
    ): CommandStreamExecutionPersistenceRecord[] {
        return results.map(({ fsa, result }) => {
            return {
                fsa,
                result:
                    result instanceof Error ? result.toString() : COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
            };
        });
    }
}
