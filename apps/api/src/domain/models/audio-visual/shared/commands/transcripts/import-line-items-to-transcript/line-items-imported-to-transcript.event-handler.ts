import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { AggregateId } from '../../../../../../../domain/types/AggregateId';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { TranscriptLineItemDto } from './import-line-items-to-transcript.command';
import { LineItemsImportedToTranscript } from './line-items-imported-to-transcript.event';

interface IRepository {
    importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]): Promise<void>;
}

interface IAudiovisualItemQueryRepositoryProvider<T extends IRepository = IRepository> {
    forResource(audiovisualResourceType: AudiovisualResourceType): T;
}

@CoscradEventConsumer('LINE_ITEMS_IMPORTED_TO_TRANSCRIPT')
export class LineItemsImportedToTranscriptEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly audiovisualItemRepositoryProvider: IAudiovisualItemQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id, type: audioVisualItemType },
            lineItems,
        },
    }: LineItemsImportedToTranscript): Promise<void> {
        await this.audiovisualItemRepositoryProvider
            .forResource(audioVisualItemType)
            .importLineItems(id, lineItems);
    }
}
