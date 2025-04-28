import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { AggregateId } from '../../../../../../../domain/types/AggregateId';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { TranscriptLineItemDto } from '../import-line-items-to-transcript';
import { LineItemAddedToTranscript } from './line-item-added-to-transcript.event';

interface IRepository {
    addLineItem(id: AggregateId, lineItem: TranscriptLineItemDto): Promise<void>;
}

interface IAudiovisualItemQueryRepositoryProvider<T extends IRepository = IRepository> {
    forResource(audiovisualResourceType: AudiovisualResourceType): T;
}

@CoscradEventConsumer('LINE_ITEM_ADDED_TO_TRANSCRIPT')
export class LineItemAddedToTranscriptEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly audiovisualItemRepositoryProvider: IAudiovisualItemQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id, type },
            text,
            languageCode,
            inPointMilliseconds,
            outPointMilliseconds,
            speakerInitials,
        },
    }: LineItemAddedToTranscript): Promise<void> {
        await this.audiovisualItemRepositoryProvider.forResource(type).addLineItem(id, {
            inPointMilliseconds,
            outPointMilliseconds,
            languageCode,
            text,
            speakerInitials,
        });
    }
}
