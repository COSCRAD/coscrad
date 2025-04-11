import { Inject } from '@nestjs/common';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { IPlaylistQueryRepository, PLAYLIST_QUERY_REPOSITORY_TOKEN } from '../queries';
import { PlaylistCreated } from './playlist-created.event';

@CoscradEventConsumer('PLAYLIST_CREATED')
export class PlaylistCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(PLAYLIST_QUERY_REPOSITORY_TOKEN)
        private readonly playlistQueryRepository: IPlaylistQueryRepository
    ) {}

    async handle({
        payload: {
            name: textForName,
            languageCodeForName,
            aggregateCompositeIdentifier: { id },
        },
    }: PlaylistCreated): Promise<void> {
        await this.playlistQueryRepository.create(
            PlaylistViewModel.fromDto({
                id,
                name: buildMultilingualTextWithSingleItem(textForName, languageCodeForName),
                episodes: [],
                // contributorIds:
            })
        );
    }
}
