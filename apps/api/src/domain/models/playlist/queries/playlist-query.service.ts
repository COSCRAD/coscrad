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
import { IPlaylistQueryRepository, PLAYLIST_QUERY_REPOSITORY_TOKEN } from '..';
import {
    CommandContext,
    CommandInfoService,
} from '../../../../app/controllers/command/services/command-info-service';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { fetchActionsForUser } from '../../../services/query-services/utilities/fetch-actions-for-user';
import { AggregateId } from '../../../types/AggregateId';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';

export class PlaylistQueryService {
    protected readonly type = ResourceType.playlist;

    constructor(
        @Inject(PLAYLIST_QUERY_REPOSITORY_TOKEN)
        private readonly repository: IPlaylistQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService,
        private readonly configService: ConfigService
    ) {}

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
            episodes: result.episodes.map((episodeWithMediaItemId) => {
                // TODO Can we share this logic with other views?
                const mediaItemUrl = `${this.configService.get(
                    'BASE_URL'
                )}/${this.configService.get('GLOBAL_PREFIX')}/resources/mediaItems/${
                    episodeWithMediaItemId.mediaItemId
                }`;

                delete episodeWithMediaItemId.mediaItemId;

                const episodeWithMediaItemUrl =
                    episodeWithMediaItemId as unknown as IPlaylistEpisode;

                episodeWithMediaItemUrl.mediaItemUrl = mediaItemUrl;

                return episodeWithMediaItemUrl;
            }),
        };
    }

    public async fetchMany(
        _userWithGroups?: CoscradUserWithGroups
    ): Promise<IIndexQueryResult<IPlayListViewModel>> {
        throw new InternalError(`fetchMany has not been implemented`);
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
}
