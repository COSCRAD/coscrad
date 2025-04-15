import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../domain/common';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { EventSourcedAudioItemViewModel } from '../../queries';
import { IAudioItemQueryRepository } from '../../queries/audio-item-query-repository.interface';
import { AudioItemCreated } from './audio-item-created.event';

@CoscradEventConsumer('AUDIO_ITEM_CREATED')
export class AudioItemCreatedEventHandler implements ICoscradEventHandler {
    private readonly audioItemRepository: IAudioItemQueryRepository;

    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        queryRepositoryProvider: IQueryRepositoryProvider
    ) {
        this.audioItemRepository =
            queryRepositoryProvider.forView<IAudioItemQueryRepository>('audioItem');
    }

    async handle(event: AudioItemCreated): Promise<void> {
        const view = EventSourcedAudioItemViewModel.fromAudioItemCreated(event);

        await this.audioItemRepository.create(view);
    }
}
