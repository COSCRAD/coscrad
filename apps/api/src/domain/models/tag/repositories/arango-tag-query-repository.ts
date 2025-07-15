import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
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
        await this.database.update(tagId, {
            label: newLabel,
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
