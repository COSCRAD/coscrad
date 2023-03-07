import { IPlayListViewModel, ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { PlaylistViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Playlist } from '../../models/playlist';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { InMemorySnapshot } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class PlaylistQueryService extends ResourceQueryService<Playlist, IPlayListViewModel> {
    protected readonly type = ResourceType.playlist;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(playlist: Playlist, _externalState: InMemorySnapshot): IPlayListViewModel {
        return new PlaylistViewModel(playlist);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Playlist];
    }
}
