import { Inject } from '@nestjs/common';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
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
        meta: { contributorIds = [] },
    }: PlaylistCreated): Promise<void> {
        await this.playlistQueryRepository.create(
            PlaylistViewModel.fromDto({
                id,
                isPublished: false,
                queryAccessControlList: new AccessControlList(),
                name: buildMultilingualTextWithSingleItem(textForName, languageCodeForName),
                episodes: [],
                // we have to add the contributions separately
            })
        );

        // TODO do this atomically in the repository
        await this.playlistQueryRepository.attribute(id, contributorIds);
    }
}
