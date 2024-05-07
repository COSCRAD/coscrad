import { AggregateType, ISongViewModel } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { isInternalError } from '../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { SongViewModel } from '../../../queries/buildViewModelForResource/viewModels/song.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { Song } from '../../models/song/song.entity';
import { Tag } from '../../models/tag/tag.entity';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class SongQueryService extends ResourceQueryService<Song, ISongViewModel> {
    protected readonly type = ResourceType.song;

    buildViewModel(
        song: Song,
        {
            resources: { audioItem: allAudioItems, mediaItem: allMediaItems },
            contributor: allContributors,
        }: InMemorySnapshot
    ): ISongViewModel {
        return new SongViewModel(song, allAudioItems, allMediaItems, allContributors);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Song];
    }

    protected override async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const tagSearchResult = await this.repositoryProvider.getTagRepository().fetchMany();

        const tags = tagSearchResult.filter((result): result is Tag => !isInternalError(result));

        const audioItemSearchResult = await this.repositoryProvider
            .forResource(AggregateType.audioItem)
            .fetchMany();

        const audioItems = audioItemSearchResult.filter(validAggregateOrThrow);

        const mediaItemSearchResult = await this.repositoryProvider
            .forResource(AggregateType.mediaItem)
            .fetchMany();

        const mediaItems = mediaItemSearchResult.filter(validAggregateOrThrow);

        const contributorSearchResult = await this.repositoryProvider
            .getContributorRepository()
            .fetchMany();

        const contributors = contributorSearchResult.filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            tag: tags,
            audioItem: audioItems,
            mediaItem: mediaItems,
            contributor: contributors,
        }).fetchFullSnapshotInLegacyFormat();
    }
}
