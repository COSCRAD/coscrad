import { Injectable } from '@nestjs/common';
import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { SongViewModel } from '../../../view-models/buildViewModelForResource/viewModels/song.view-model';
import { Song } from '../../models/song/song.entity';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class SongQueryService extends BaseQueryService<Song, SongViewModel> {
    constructor(repositoryProvider: RepositoryProvider, commandInfoService: CommandInfoService) {
        super(ResourceType.song, repositoryProvider, commandInfoService);
    }

    buildViewModel(song: Song, _: InMemorySnapshot) {
        return new SongViewModel(song);
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(Song);
    }
}
