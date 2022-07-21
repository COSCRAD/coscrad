import { Injectable } from '@nestjs/common';
import { CommandInfo } from '../../../app/controllers/command/services/command-info-service';
import { SongViewModel } from '../../../view-models/buildViewModelForResource/viewModels/song.view-model';
import { Song } from '../../models/song/song.entity';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class SongQueryService extends BaseQueryService<Song, SongViewModel> {
    protected readonly type = ResourceType.song;

    buildViewModel(song: Song, _: InMemorySnapshot) {
        return new SongViewModel(song);
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(Song);
    }
}
