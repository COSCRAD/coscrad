import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { AggregateId } from '../../../types/AggregateId';
import { IResourceConnectionDto } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { BaseArangoResourceViewQueryBuilder } from '../../term/repositories/base-arango-resource-query-builder';
import { IDigitalTextQueryRepository } from './digital-text-query-repository.interface';

export class ArangoDigitalTextQueryRepository implements IDigitalTextQueryRepository {
    private readonly database: ArangoDatabaseForCollection<DigitalTextViewModel>;

    private readonly baseResourceQueryBuilder: BaseArangoResourceViewQueryBuilder;

    constructor(private readonly connectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            'digitalText__VIEWS'
        );

        this.baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder(
            'digitalText__VIEWS'
        );
    }

    create(digitalText: DigitalTextViewModel): Promise<void> {
        return this.database.create(mapEntityDTOToDatabaseDocument(digitalText));
    }

    async createMany(digitalTexts: DigitalTextViewModel[]): Promise<void> {
        const viewDocuments = digitalTexts.map(mapEntityDTOToDatabaseDocument);

        await this.database.createMany(viewDocuments);
    }

    async fetchById(id: AggregateId): Promise<Maybe<DigitalTextViewModel>> {
        const searchResult = await this.database.fetchById(id);

        if (isNotFound(searchResult)) {
            return NotFound;
        }

        return DigitalTextViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(searchResult));
    }

    async fetchMany(): Promise<DigitalTextViewModel[]> {
        const result = await this.database.fetchMany();

        return result.map((doc) =>
            DigitalTextViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(doc))
        );
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.allowUser(aggregateId, userId));
    }

    async tag(id: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(id, tagId));
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.createNoteAbout(id, dto));
    }

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.connectResourcesWithNote(id, dto));
    }

    async publish(id: AggregateId): Promise<void> {
        await this.database.update(id, {
            isPublished: true,
        });
    }

    async attribute(id: string, event: BaseEvent): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.attribute(id, event));
    }
}
