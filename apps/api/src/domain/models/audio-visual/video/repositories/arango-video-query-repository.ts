/* eslint-disable @typescript-eslint/no-unused-vars */
import { IDetailQueryResult, IMultilingualTextItem, ResourceType } from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { ArangoResourceQueryBuilder } from '../../../term/repositories/arango-resource-query-builder';
import { TranslationLineItemDto } from '../../audio-item/queries/audio-item-query-repository.interface';
import { TranscriptLineItemDto, TranslationItem } from '../../shared/commands';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { ArangoTranscriptQueryBuilder } from '../../shared/queries/transcript-query-builder';
import { EventSourcedVideoViewModel, IVideoQueryRepository } from '../queries';

export class ArangoVideoQueryRepository implements IVideoQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<EventSourcedVideoViewModel>
    >;

    private readonly baseResourceQueryBuilder = new ArangoResourceQueryBuilder('video__VIEWS');

    private readonly transcriptQueryBuilder = new ArangoTranscriptQueryBuilder(ResourceType.video);

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'video__VIEWS'
        );
    }

    async allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.allowUser(aggregateId, userId));
    }

    async publish(id: AggregateId): Promise<void> {
        await this.database.update(id, {
            isPublished: true,
        });
    }

    async createMany(view: EventSourcedVideoViewModel[]): Promise<void> {
        await this.database.createMany(view.map(mapEntityDTOToDatabaseDocument));
    }

    async fetchMany(): Promise<EventSourcedVideoViewModel[]> {
        const documents = await this.database.fetchMany();

        return documents.map(mapDatabaseDocumentToAggregateDTO) as EventSourcedVideoViewModel[];
    }

    async create(view: EventSourcedVideoViewModel): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async fetchById(id: AggregateId): Promise<Maybe<EventSourcedVideoViewModel>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) {
            return NotFound;
        }

        const dto = mapDatabaseDocumentToAggregateDTO(result);

        return EventSourcedVideoViewModel.fromDto(dto);
    }

    async translateName(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
        const cursor = await this.database
            .query(this.baseResourceQueryBuilder.translateName(id, text, languageCode, role))
            .catch((reason) => {
                throw new InternalError(`Failed to translate video via VideoRepository: ${reason}`);
            });

        await cursor.all();
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    /**
     * Transcription
     */
    async createTranscript(id: AggregateId): Promise<void> {
        const aqlQuery = this.transcriptQueryBuilder.createTranscript(id);

        await this.database.query(aqlQuery);
    }

    async addParticipant(id: AggregateId, participant: TranscriptParticipant) {
        await this.database.query(this.transcriptQueryBuilder.addParticipant(id, participant));
    }

    async addLineItem(id: AggregateId, lineItem: TranscriptLineItemDto): Promise<void> {
        await this.database.query(this.transcriptQueryBuilder.addLineItem(id, lineItem));
    }

    async importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]) {
        await this.database.query(this.transcriptQueryBuilder.importLineItems(id, lineItems));
    }

    async translateLineItem(id: AggregateId, lineItem: TranslationLineItemDto) {
        await this.database.query(this.transcriptQueryBuilder.translateLineItem(id, lineItem));
    }

    async importTranslationsForTranscript(
        id: AggregateId,
        translations: TranslationItem[]
    ): Promise<void> {
        await this.database.query(
            this.transcriptQueryBuilder.importTranslationsForTranscript(id, translations)
        );
    }
}
