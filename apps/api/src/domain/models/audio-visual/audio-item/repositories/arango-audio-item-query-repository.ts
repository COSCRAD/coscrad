import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IMultilingualTextItem,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { IResourceConnectionDto } from '../../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { INoteCreationDto } from '../../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { BaseArangoResourceViewQueryBuilder } from '../../../term/repositories/base-arango-resource-query-builder';
import { ContributionSummary } from '../../../user-management';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { ArangoTranscriptQueryBuilder } from '../../shared/queries/transcript-query-builder';
import { TranscriptLineItemDto, TranslationItem } from '../commands';
import { EventSourcedAudioItemViewModel } from '../queries';
import {
    IAudioItemQueryRepository,
    TranslationLineItemDto,
} from '../queries/audio-item-query-repository.interface';

export class ArangoAudioItemQueryRepository implements IAudioItemQueryRepository {
    private readonly database: ArangoDatabaseForCollection<
        IDetailQueryResult<EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] }>
    >;

    private readonly baseResourceQueryBuilder = new BaseArangoResourceViewQueryBuilder(
        'audioItem__VIEWS'
    );

    private readonly transcriptQueryBuilder = new ArangoTranscriptQueryBuilder(
        ResourceType.audioItem
    );

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.database = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            'audioItem__VIEWS'
        );
    }

    async create(
        view: IDetailQueryResult<EventSourcedAudioItemViewModel> & {
            _actions: ICommandFormAndLabels[];
        }
    ): Promise<void> {
        await this.database.create(mapEntityDTOToDatabaseDocument(view));
    }

    async createMany(
        views: (EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] } & {
            actions: ICommandFormAndLabels[];
        })[]
    ): Promise<void> {
        await this.database.createMany(views.map(mapEntityDTOToDatabaseDocument));
    }

    async delete(id: AggregateId): Promise<void> {
        return this.database.delete(id);
    }

    async publish(id: AggregateId): Promise<void> {
        await this.database.update(id, {
            isPublished: true,
        });
    }

    async tag(audioItemId: string, tagId: string): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.tag(audioItemId, tagId));
    }

    async attribute(id: string, contributionSummary: ContributionSummary): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.attribute(id, contributionSummary));
    }

    async createNoteAbout(id: string, dto: INoteCreationDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.createNoteAbout(id, dto));
    }

    async createConnection(id: string, dto: IResourceConnectionDto): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.connectResourcesWithNote(id, dto));
    }

    async fetchById(
        id: AggregateId
    ): Promise<Maybe<EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] }>> {
        const result = await this.database.fetchById(id);

        if (isNotFound(result)) return result;

        // should we rename this helper method?
        const dto = mapDatabaseDocumentToAggregateDTO(result) as EventSourcedAudioItemViewModel & {
            actions: ICommandFormAndLabels[];
        };

        return EventSourcedAudioItemViewModel.fromDto(dto);
    }

    async fetchMany(): Promise<
        (EventSourcedAudioItemViewModel & { actions: ICommandFormAndLabels[] })[]
    > {
        const documents = await this.database.fetchMany();

        return documents.map((doc) =>
            EventSourcedAudioItemViewModel.fromDto(mapDatabaseDocumentToAggregateDTO(doc))
        ) as (EventSourcedAudioItemViewModel & {
            actions: ICommandFormAndLabels[];
        })[];
    }

    async translateName(
        id: AggregateId,
        { text, languageCode, role }: IMultilingualTextItem
    ): Promise<void> {
        const cursor = await this.database
            .query(this.baseResourceQueryBuilder.translateName(id, text, languageCode, role))
            .catch((reason) => {
                throw new InternalError(`Failed to translate term via TermRepository: ${reason}`);
            });

        await cursor.all();
    }

    async createTranscript(id: AggregateId): Promise<void> {
        const cursor = await this.database.query(this.transcriptQueryBuilder.createTranscript(id));

        await cursor.all();
    }

    async addParticipant(id: AggregateId, participant: TranscriptParticipant) {
        const cursor = await this.database.query(
            this.transcriptQueryBuilder.addParticipant(id, participant)
        );

        await cursor.all();
    }

    async addLineItem(id: AggregateId, lineItem: TranscriptLineItemDto): Promise<void> {
        await this.database.query(this.transcriptQueryBuilder.addLineItem(id, lineItem));
    }

    async importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]) {
        await this.database.query(this.transcriptQueryBuilder.importLineItems(id, lineItems));
    }

    async translateLineItem(
        id: AggregateId,
        // TODO Consider whether the out point is actually necessary here
        translationItem: TranslationLineItemDto
    ) {
        await this.database.query(
            this.transcriptQueryBuilder.translateLineItem(id, translationItem)
        );
    }

    async importTranslationsForTranscript(
        id: AggregateId,
        translations: TranslationItem[]
    ): Promise<void> {
        await this.database.query(
            this.transcriptQueryBuilder.importTranslationsForTranscript(id, translations)
        );
    }

    async count(): Promise<number> {
        return this.database.getCount();
    }

    async allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void> {
        await this.database.query(this.baseResourceQueryBuilder.allowUser(aggregateId, userId));
    }
}
