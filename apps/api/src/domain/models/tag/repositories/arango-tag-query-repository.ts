import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { EventSourcedTagRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { AggregateId } from '../../../types/AggregateId';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { ITagQueryRepository } from './tag-query-repository.interface';

export class ArangoTagQueryRepository implements ITagQueryRepository {
    private readonly database: ArangoDatabaseForCollection<EventSourcedTagRecordForResourceViewModel>;

    private readonly baseResouceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(private readonly connectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            'tag__VIEWS'
        );

        this.baseResouceQueryBuilder = new BaseArangoResourceViewQueryBuilder('tag__VIEWS');
    }

    async fetchById(id: AggregateId): Promise<Maybe<EventSourcedTagRecordForResourceViewModel>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) {
            return result;
        }

        return EventSourcedTagRecordForResourceViewModel.fromDto(
            mapDatabaseDocumentToAggregateDTO(result)
        );
    }

    async fetchMany(): Promise<EventSourcedTagRecordForResourceViewModel[]> {
        const docs = await this.database.fetchMany();

        return docs.map((doc) =>
            EventSourcedTagRecordForResourceViewModel.fromDto(
                mapDatabaseDocumentToAggregateDTO(doc)
            )
        );
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async create(tag: EventSourcedTagRecordForResourceViewModel): Promise<void> {
        // TODO add toDto
        return this.database.create(mapEntityDTOToDatabaseDocument(tag));
    }

    async createMany(tags: EventSourcedTagRecordForResourceViewModel[]): Promise<void> {
        await this.database.createMany(tags.map(mapEntityDTOToDatabaseDocument));
    }

    async delete(_id: AggregateId): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async relabel(_tagId: string, _newLabel: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async tagResourceOrNote(
        tagId: string,
        categorizableCompositeIdentifier: CategorizableCompositeIdentifier
    ): Promise<void> {
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
