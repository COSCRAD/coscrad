import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IIndexQueryResult,
    IPlaylistEpisode,
    IPlayListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { PlaylistEpisodeViewModel } from '../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { Playlist } from '../../models/playlist';
import { IPlaylistQueryRepository } from '../../models/playlist/queries/playlist-query-repository.interface';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../models/shared/common-commands/publish-resource/resource-published.event-handler';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

export class PlaylistQueryService {
    protected readonly type = ResourceType.playlist;

    private readonly repository: IPlaylistQueryRepository;

    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        queryRepositoryProvider: IQueryRepositoryProvider,
        @Inject(CommandInfoService) private readonly commandInfoService,
        private readonly configService: ConfigService
    ) {
        this.repository = queryRepositoryProvider.forResource<IPlaylistQueryRepository>('playlist');
    }

    public async fetchById(
        id: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IDetailQueryResult<IPlayListViewModel>>> {
        const result = await this.repository.fetchById(id);

        if (isNotFound(result)) return result;

        const playlist = result.forUser(userWithGroups);

        if (isNotFound(playlist)) {
            return NotFound;
        }

        return {
            ...playlist,
            actions: this.fetchUserActions(userWithGroups, [playlist]),
            contributions: [],
            episodes: result.episodes.map((episodeWithMediaItemId) =>
                this.appendMediaItemUrlToPlaylistEpisode(episodeWithMediaItemId)
            ),
        };
    }

    public async fetchMany(
        userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<IPlayListViewModel>> {
        const result = await this.repository.fetchMany();

        return {
            // TODO Can we change this to `PlaylistViewModel`?
            indexScopedActions: this.fetchUserActions(userWithGroups, [Playlist]),
            entities: result.flatMap((playlist) => {
                const result = playlist.forUser(userWithGroups);

                if (isNotFound(result)) {
                    return [];
                }

                // @ts-expect-error We need a better way to encapsulate this mapping layer
                result.episodes = result.episodes.map((e) =>
                    this.appendMediaItemUrlToPlaylistEpisode(e as PlaylistEpisodeViewModel)
                );

                // @ts-expect-error Fix this warning
                result.actions = this.fetchUserActions(userWithGroups, [result]);

                return result;
            }),
        };
    }

    // TODO share this code with other query services
    private fetchUserActions(
        systemUser: CoscradUserWithGroups,
        commandContexts: CommandContext[]
    ): ICommandFormAndLabels[] {
        return commandContexts.flatMap((commandContext) =>
            fetchActionsForUser(this.commandInfoService, systemUser, commandContext)
        );
    }

    private appendMediaItemUrlToPlaylistEpisode(episodeWithMediaItemId: PlaylistEpisodeViewModel) {
        // TODO Can we share this logic with other views?
        const mediaItemUrl = `${this.configService.get('BASE_URL')}/${this.configService.get(
            'GLOBAL_PREFIX'
        )}/resources/mediaItems/${episodeWithMediaItemId.mediaItemId}`;

        delete episodeWithMediaItemId.mediaItemId;

        const episodeWithMediaItemUrl = episodeWithMediaItemId as unknown as IPlaylistEpisode;

        episodeWithMediaItemUrl.mediaItemUrl = mediaItemUrl;

        return episodeWithMediaItemUrl;
    }
}
