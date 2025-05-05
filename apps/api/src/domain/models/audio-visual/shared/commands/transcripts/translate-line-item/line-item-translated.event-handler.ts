import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { AggregateId } from '../../../../../../../domain/types/AggregateId';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { TranslateLineItem, TranslationLineItemDto } from './translate-line-item.command';

interface IRepository {
    translateLineItem(id: AggregateId, lineItem: TranslationLineItemDto): Promise<void>;
}

interface IAudiovisualItemQueryRepositoryProvider<T extends IRepository = IRepository> {
    forResource(audiovisualResourceType: AudiovisualResourceType): T;
}

export class LineItemTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly audioVisualItemRepositoryProvider: IAudiovisualItemQueryRepositoryProvider
    ) {}

    async handle({
        aggregateCompositeIdentifier: { id, type: audioVisualItemType },
        lineItem: { languageCode },
    }: TranslateLineItem): Promise<void> {
        await this.audioVisualItemRepositoryProvider
            .forResource(audioVisualItemType)
            .translateLineItem(id, new TranslationLineItemDto(languageCode));
    }
}
