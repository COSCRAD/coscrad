import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
import { AqlQuery } from 'arangojs/aql';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ITagQueryRepository } from './tag-query-repository.interface';

export class ArangoTagQueryRepository implements ITagQueryRepository {
    private readonly database: ArangoDatabaseForCollection<DTO<EventSourcedTagViewModel>>;

    private readonly baseResouceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(private readonly connectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            'tag__VIEWS'
        );

        this.baseResouceQueryBuilder = new BaseArangoResourceViewQueryBuilder('tag__VIEWS');
    }

    async fetchById(id: AggregateId): Promise<Maybe<EventSourcedTagViewModel>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) {
            return result;
        }

        return EventSourcedTagViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(result));
    }

    async fetchMany(): Promise<EventSourcedTagViewModel[]> {
        const docs = await this.database.fetchMany();

        return docs.map((doc) =>
            EventSourcedTagViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(doc))
        );
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async create(tag: EventSourcedTagViewModel): Promise<void> {
        return this.database.create(mapEntityDTOToDatabaseDocument(tag.toDto()));
    }

    async createMany(tags: EventSourcedTagViewModel[]): Promise<void> {
        await this.database.createMany(tags.map((t) => mapEntityDTOToDatabaseDocument(t.toDto())));
    }

    // TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-94?atlOrigin=eyJpIjoiY2M3NGQ4MjhhNDNmNDVjNWI3YzE4NTQzNGVlMzVhMzkiLCJwIjoiaiJ9] opt-in
    async delete(_id: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async relabel(tagId: string, newLabel: string): Promise<void> {
        const existingTagDto = await this.database.fetchById(tagId);

        if (isNotFound(existingTagDto)) {
            // TODO log this system error
            return;
        }

        const existingTag = EventSourcedTagViewModel.fromDto(
            mapDatabaseDocumentToAggregateDTO(existingTagDto)
        );

        const categorizablesRequiringACascadingUpdate = existingTag.groupMembers();

        const collectionNames = Array.from(categorizablesRequiringACascadingUpdate.keys()).map(
            (categorizableType) => `${categorizableType}__VIEWS`
        );

        collectionNames.push('tag__VIEWS');

        const queries: AqlQuery[] = [];

        const categorizableTypeAndIdsOfAffectedEntitites = Array.from(
            categorizablesRequiringACascadingUpdate.entries()
        );

        for (const typeAndDocIds of categorizableTypeAndIdsOfAffectedEntitites) {
            const [categorizableType, docIds] = typeAndDocIds;

            const cascadeQuery = `
                FOR doc IN @@collectionName
                FILTER CONTAINS_ARRAY(@docIds,doc._key)
                LET newTags = (
                    FOR t IN doc.tags
                    RETURN t.id == @tagId ? MERGE(t,{ label: @newLabel }) : t
                )
                UPDATE doc with {
                    tags: newTags
                } in @@collectionName

                return newTags
            `;

            // TODO update `name` prop as well

            const bindVars = {
                '@collectionName': `${categorizableType}__VIEWS`,
                docIds,
                tagId,
                newLabel,
            };

            queries.push({ query: cascadeQuery, bindVars });
        }

        const tagUpdateQuery = `
            FOR t IN tag__VIEWS
            FILTER t._key == @tagId
            UPDATE t WITH {
                label: @newLabel
            } IN tag__VIEWS
        `;

        queries.push({
            query: tagUpdateQuery,
            bindVars: {
                tagId,
                newLabel,
            },
        });

        await this.database
            .getDb()
            .transaction(queries, collectionNames)
            .catch((e) => {
                throw new InternalError(`Failed to relabel tag ${tagId} in query database`, [
                    new InternalError(e?.message || 'unknown Arango error'),
                ]);
            });
    }

    async tagResourceOrNote(
        tagId: string,
        categorizableCompositeIdentifier: CategorizableCompositeIdentifier
    ): Promise<void> {
        /**
         * TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-211]
         *
         * In the future, we want to join in the full resource views as well.
         *
         * Note that this will require binding the resource collection name using the
         * bind vars, because AQL requires all collections to be known before
         * executing a query (for optimization purposes on their end).
         */
        const query = `
        FOR doc IN @@collectionName
        FILTER doc._key == @id
        UPDATE doc WITH {
            members: doc.members == null ? [@newMember] : APPEND(doc.members,@newMember)
        } IN @@collectionName
        `;

        const bindVars = {
            '@collectionName': 'tag__VIEWS',
            id: tagId,
            newMember: categorizableCompositeIdentifier,
        };

        await this.database.query({ query, bindVars });
    }
}
