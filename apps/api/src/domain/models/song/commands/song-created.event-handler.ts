import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../common';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../queries/song.view-model.event.sourced';
import { SongCreated } from './song-created.event';

@CoscradEventConsumer('SONG_CREATED')
export class SongCreatedEventHandler implements ICoscradEventHandler {
    private readonly songQueryRepository: ISongQueryRepository;

    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        queryRepositoryProvider: IQueryRepositoryProvider
    ) {
        this.songQueryRepository = queryRepositoryProvider.forResource<ISongQueryRepository>(
            ResourceType.song
        );
    }

    async handle(event: SongCreated): Promise<void> {
        const newSong = EventSourcedSongViewModel.fromSongCreated(event);

        await this.songQueryRepository.create(newSong);
    }
}
