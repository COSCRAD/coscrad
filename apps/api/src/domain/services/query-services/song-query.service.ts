import { IDetailQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import {
    ISongQueryRepository,
    SONG_QUERY_REPOSITORY_TOKEN,
} from '../../models/song/queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../../models/song/queries/song.view-model.event.sourced';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { fetchActionsForUser } from './utilities/fetch-actions-for-user';

@Injectable()
export class SongQueryService {
    protected readonly type = ResourceType.song;

    constructor(
        @Inject(SONG_QUERY_REPOSITORY_TOKEN)
        private readonly songQueryRepository: ISongQueryRepository,
        private readonly commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {}

    async fetchById(
        id: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IDetailQueryResult<ISongViewModel>>> {
        const result = (await this.songQueryRepository.fetchById(id)) as EventSourcedSongViewModel;

        const transformed = result as unknown as ISongViewModel;

        if (!isNotFound(result)) {
            transformed.audioURL = this.buildAudioUrl(result.mediaItemId);

            transformed.actions = fetchActionsForUser(
                this.commandInfoService,
                userWithGroups,
                result
            );
        }

        return transformed;
    }

    private buildAudioUrl(mediaItemId: AggregateId): string {
        if (!isNonEmptyString(mediaItemId)) return undefined;

        return `${this.configService.get('BASE_URL')}/${this.configService.get(
            'GLOBAL_PREFIX'
        )}/resources/mediaItems/download/${mediaItemId}`;
    }
}
