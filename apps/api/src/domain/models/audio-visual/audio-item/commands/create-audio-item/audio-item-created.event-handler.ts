import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../domain/common';
import { EventSourcedAudioItemViewModel } from '../../queries';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../queries/audio-item-query-repository.interface';
import { AudioItemCreated } from './audio-item-created.event';

@CoscradEventConsumer('AUDIO_ITEM_CREATED')
export class AudioItemCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN)
        private readonly audioItemRepository: IAudioItemQueryRepository
    ) {}

    async handle(event: AudioItemCreated): Promise<void> {
        const view = EventSourcedAudioItemViewModel.fromAudioItemCreated(event);

        await this.audioItemRepository.create(view);
    }
}
