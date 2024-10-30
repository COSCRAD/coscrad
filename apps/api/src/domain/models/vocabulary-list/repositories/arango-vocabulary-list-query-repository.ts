import {
    ICommandFormAndLabels,
    IMultilingualTextItem,
    IValueAndDisplay,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from '../../../../coscrad-cli/logging';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToEntityDto from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDtoToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { FilterPropertyType } from '../commands';
import { VocabularyListEntryImportItem } from '../entities/vocabulary-list.entity';
import { IVocabularyListQueryRepository } from '../queries/vocabulary-list-query-repository.interface';

export class ArangoVocabularyListQueryRepository implements IVocabularyListQueryRepository {
    private readonly database: ArangoDatabaseForCollection<IVocabularyListViewModel>;

    constructor(
        arangoConnectionProvider: ArangoConnectionProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) _logger: ICoscradLogger
    ) {
        // why not do this in the module instead of here?
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'vocabularyList__VIEWS'
        );
    }

    async fetchById(
        id: AggregateId
    ): Promise<Maybe<IVocabularyListViewModel & { actions: ICommandFormAndLabels[] }>> {
        const documentSearchResult = await this.database.fetchById(id);

        return isNotFound(documentSearchResult)
            ? documentSearchResult
            : (mapDatabaseDocumentToEntityDto(documentSearchResult) as IVocabularyListViewModel & {
                  actions: ICommandFormAndLabels[];
              });
    }

    async fetchMany(): Promise<
        (IVocabularyListViewModel & { actions: ICommandFormAndLabels[] })[]
    > {
        const documents = await this.database.fetchMany();

        return documents.map(mapDatabaseDocumentToEntityDto) as (IVocabularyListViewModel & {
            actions: ICommandFormAndLabels[];
        })[];
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async create(
        view: IVocabularyListViewModel & { actions: ICommandFormAndLabels[] }
    ): Promise<void> {
        // TODO If we're going to throw here, we need to wrap the top level event handlers in a try...catch
        return this.database.create(mapEntityDtoToDatabaseDocument(view)).catch((error) => {
            throw new InternalError(
                `failed to create vocabulary list view in ArangoVocabularyListQueryRepository`,
                [error]
            );
        });
    }

    async createMany(
        views: (IVocabularyListViewModel & { actions: ICommandFormAndLabels[] })[]
    ): Promise<void> {
        return this.database
            .createMany(views.map(mapEntityDtoToDatabaseDocument))
            .catch((error) => {
                throw new InternalError(
                    `failed to create many vocabulary list views in ArangoVocabularyListQueryRepository`,
                    [error]
                );
            });
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    // note that it is important to pass APPEND an array of items to append when appending a string value to an existing array
    async allowUser(termId: AggregateId, userId: AggregateId): Promise<void> {
        const query = `
    FOR doc IN @@collectionName
    FILTER doc._key == @id
    UPDATE doc WITH {
        accessControlList: {
            allowedUserIds: APPEND(doc.accessControlList.allowedUserIds,[@userId])
        }
    } IN @@collectionName
    `;

        const bindVars = {
            '@collectionName': 'vocabularyList__VIEWS',
            id: termId,
            userId,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });

        await cursor.all();
    }

    async publish(id: AggregateId): Promise<void> {
        return this.database.update(id, { isPublished: true }).catch((error) => {
            throw new InternalError(`Failed to publish view for vocabulary list ${id}`, [error]);
        });
    }

    async attribute(termId: AggregateId, contributorIds: AggregateId[]): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        LET newContributions = (
            FOR contributorId IN @contributorIds
                FOR c in contributors
                    FILTER c._key == contributorId
                    return {
                        id: c._key,
                        fullName: CONCAT(CONCAT(c.fullName.firstName,' '),c.fullName.lastName)
                    }
        )
        LET updatedContributions = APPEND(doc.contributions,newContributions)
        UPDATE doc WITH {
            contributions: updatedContributions
        } IN @@collectionName
         RETURN updatedContributions
        `;

        const bindVars = {
            // todo is this necessary?
            '@collectionName': 'vocabularyList__VIEWS',
            id: termId,
            contributorIds,
        };

        await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });
    }

    async translateName(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newItem = {
                    text: @text,
                    languageCode: @languageCode,
                    role: @role
        }
        UPDATE doc WITH {
            name: {
                items: APPEND(doc.name.items,newItem)
            }
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'vocabularyList__VIEWS',
            id: id,
            text: text,
            role: role,
            languageCode: languageCode,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });

        await cursor.all();
    }

    async registerFilterProperty(
        id: AggregateId,
        name: string,
        type: FilterPropertyType,
        allowedValuesAndLabels: { value: string | boolean; label: string }[]
    ) {
        const options: IValueAndDisplay<string | boolean>[] = allowedValuesAndLabels.map(
            // this mapping layer is a bit unfortunate
            ({ value, label }) => ({
                value,
                display: label,
            })
        );

        /**
         *
         */
        const _query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newField = {
                    name: @name,
                    type: @type,
                    options: @options
        }
        UPDATE doc WITH {
            form: {
                fields: PUSH(doc.form.fields,newField)
            }
        } IN @@collectionName
        OPTIONS { mergeObjects: false }
        RETURN OLD
        `;

        const _bindVars = {
            '@collectionName': 'vocabularyList__VIEWS',
            id,
            name,
            type,
            options,
        };

        /**
         * We need to figure out why we get the dreaded `write-write` conflict
         * with arango. 
         * 
         * Note that the following query works fine when executed from the ArangoDB dashboard:
         * 
            for e in events
            filter e.type == 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED'
                for v in vocabularyList__VIEWS
                filter v._key == e.payload.aggregateCompositeIdentifier.id
                update v with {
                form: {
                fields: push(v.form.fields,{
                    name: e.payload.name,
                    type: e.payload.type,
                    allowedValuesAndLabels: e.payload.allowedValuesAndLabels
                })
                }
                } in vocabularyList__VIEWS
                OPTIONS { mergeObjects: false }
         */

        // const cursor = await this.database
        //     .query({
        //         query,
        //         bindVars,
        //     })
        //     .catch((reason) => {
        //         // TODO fix all error messages
        //         throw new InternalError(
        //             `Failed to register vocabulary list filter property via VocabularyListRepository: ${reason}`
        //         );
        //     });

        // await cursor.all();
    }

    async addTerm(vocabularyListId: AggregateId, termId: AggregateId): Promise<void> {
        /**
         * TODO We need to decide where to implement the "thin mapping layer"
         * to convert Arango documents to view models (e.g., _key -> id) for
         * eagerly joined data. See the way term ID is handled below.
         *
         * Because we are aiming to only send the "deltas" to the database
         * in the query layer (with no fetching \ hydration of instances), we
         * have to repeat `mapDatabaseDocumentToEntityDto` here. It feels more
         * natural to do this in the query service.
         */
        const query = `
            for v in @@collectionName
            filter v._key == @id
            for t in term__VIEWS
            filter t._key == @termId
            let newEntry = {
                term: MERGE(t,{id: t._key}),
                variableValues: {}
            }
            update v with {
                entries: APPEND(v.entries,newEntry)
            } in @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'vocabularyList__VIEWS',
            id: vocabularyListId,
            termId,
        };

        const cursor = await this.database.query({ query, bindVars }).catch((error) => {
            throw new InternalError(
                `failed to add term: ${termId} to vocabulary list: ${vocabularyListId}`,
                [error]
            );
        });

        await cursor.all();
    }

    async analyzeTerm(
        vocabularyListId: AggregateId,
        termId: AggregateId,
        propertyValues: Record<string, string | boolean>
    ): Promise<void> {
        const query = `
        for v in @@collectionName
        filter v._key == @vocabularyListId
        let newEntries = (
            for e in v.entries
            let propertyValueUpdates = e.term.id == @termId ? @propertyValues : {}
            return MERGE(e,{ variableValues: MERGE(e.variableValues,propertyValueUpdates)})
        ) 
        update v with {
            entries: newEntries
        } in @@collectionName
        return OLD
        `;

        const cursor = await this.database
            .query({
                query,
                bindVars: {
                    '@collectionName': 'vocabularyList__VIEWS',
                    vocabularyListId,
                    termId,
                    propertyValues,
                },
            })
            .catch((error) => {
                throw new InternalError(
                    `Failed to analyze entry (term: ${termId}) in vocabulary list: ${vocabularyListId}`,
                    [error]
                );
            });

        await cursor.all();
    }

    /**
     * TODO change ~~variableValues~~ to ~~propertyValues~~ (breaking change to contract with client)
     */
    async importEntries(
        vocabularyListId: AggregateId,
        entries: VocabularyListEntryImportItem[]
    ): Promise<void> {
        const query = `
        for v in @@collectionName
        filter v._key == @vocabularyListId
        let newEntries = (
            for e in @entries
            for t in term__VIEWS
            filter t._key == e.termId
            return {
                term: MERGE(t,{
                    id: t._key
                }),
                variableValues: e.propertyValues
            }
        )
        update v with {
            entries: APPEND(v.entries,newEntries)
        } in @@collectionName
        `;

        const cursor = await this.database
            .query({
                query,
                bindVars: {
                    '@collectionName': 'vocabularyList__VIEWS',
                    vocabularyListId,
                    entries,
                },
            })
            .catch((error) => {
                throw new InternalError(
                    `Failed to import entries (${JSON.stringify(
                        entries
                    )}) to vocabulary list: ${vocabularyListId}`,
                    [error]
                );
            });

        await cursor.all();
    }
}