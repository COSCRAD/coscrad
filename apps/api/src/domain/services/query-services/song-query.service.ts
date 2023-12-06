import { ISongViewModel } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { SongViewModel } from '../../../queries/buildViewModelForResource/viewModels/song.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Song } from '../../models/song/song.entity';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class SongQueryService extends ResourceQueryService<Song, ISongViewModel> {
    protected readonly type = ResourceType.song;

    buildViewModel(
        song: Song,
        { resources: { audioItem: allAudioItems, mediaItem: allMediaItems } }: InMemorySnapshot
    ): ISongViewModel {
        return new SongViewModel(song, allAudioItems, allMediaItems);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Song];
    }
}
