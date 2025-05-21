import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IPlaylistQueryRepository } from '../queries/playlist-query-repository.interface';
import { PlaylistCreated } from './playlist-created.event';

@CoscradEventConsumer('PLAYLIST_CREATED')
export class PlaylistCreatedEventHandler implements ICoscradEventHandler {
    private readonly playlistQueryRepository: IPlaylistQueryRepository;

    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        queryRepositoryProvider: IQueryRepositoryProvider
    ) {
        this.playlistQueryRepository =
            queryRepositoryProvider.forResource<IPlaylistQueryRepository>(ResourceType.playlist);
    }

    async handle(event: PlaylistCreated): Promise<void> {
        const {
            payload: {
                name: textForName,
                languageCodeForName,
                aggregateCompositeIdentifier: { id },
            },
        } = event;

        await this.playlistQueryRepository.create(
            PlaylistViewModel.fromDto({
                id,
                isPublished: false,
                queryAccessControlList: new AccessControlList(),
                name: buildMultilingualTextWithSingleItem(textForName, languageCodeForName),
                episodes: [],
                // we have to add the contributions separately
                contributions: [],
            })
        );

        // TODO do this atomically in the repository
        await this.playlistQueryRepository.attribute(id, event);
    }
}
