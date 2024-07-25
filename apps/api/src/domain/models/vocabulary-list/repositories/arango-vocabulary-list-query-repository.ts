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
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToEntityDto from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDtoToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { AggregateId } from '../../../types/AggregateId';
import { FilterPropertyType } from '../commands';
import { IVocabularyListQueryRepository } from '../queries/vocabulary-list-query-repository.interface';

export class ArangoVocabularyListQueryRepository implements IVocabularyListQueryRepository {
    private readonly database: ArangoDatabaseForCollection<IVocabularyListViewModel>;

    constructor(
        databaseProvider: ArangoDatabaseProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) _logger: ICoscradLogger
    ) {
        this.database = databaseProvider.getDatabaseForCollection('vocabularyList__VIEWS');
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
     RETURN OLD
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

        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        let newField = {
                    name: @name,
                    type: @type,
                    options: @options
        }
        UPDATE doc WITH {
            form: {
                fields: APPEND(doc.form.fields,newField)
            }
        } IN @@collectionName
         RETURN OLD
        `;

        const bindVars = {
            '@collectionName': 'vocabularyList__VIEWS',
            id,
            name,
            type,
            options,
        };

        const cursor = await this.database
            .query({
                query,
                bindVars,
            })
            .catch((reason) => {
                // TODO fix all error messages
                throw new InternalError(
                    `Failed to register vocabulary list filter property via TermRepository: ${reason}`
                );
            });

        await cursor.all();
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
}
