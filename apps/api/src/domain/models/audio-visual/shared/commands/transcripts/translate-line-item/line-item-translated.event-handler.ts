import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { AggregateId } from '../../../../../../../domain/types/AggregateId';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { LineItemTranslated } from './line-item-translated.event';
import { TranslateLineItem } from './translate-line-item.command';

interface IRepository {
    translateLineItem(id: AggregateId, lineItem: TranslateLineItem): Promise<void>;
}

interface IAudiovisualItemQueryRepositoryProvider<T extends IRepository = IRepository> {
    forResource(audiovisualResourceType: AudiovisualResourceType): T;
}

@CoscradEventConsumer('LINE_ITEM_TRANSLATED')
export class LineItemTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly audioVisualItemRepositoryProvider: IAudiovisualItemQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id, type: audioVisualItemType },
            inPointMilliseconds,
            outPointMilliseconds,
            translation,
            languageCode,
        },
    }: LineItemTranslated): Promise<void> {
        await this.audioVisualItemRepositoryProvider
            .forResource(audioVisualItemType)
            .translateLineItem(id, {
                aggregateCompositeIdentifier: { id, type: audioVisualItemType },
                inPointMilliseconds,
                outPointMilliseconds,
                translation,
                languageCode,
            });
    }
}
