import { AggregateType, IPhotographViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { PhotographViewModel } from '../../../queries/buildViewModelForResource/viewModels/photograph.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { Photograph } from '../../models/photograph/entities/photograph.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class PhotographQueryService extends ResourceQueryService<Photograph, IPhotographViewModel> {
    protected readonly type = ResourceType.photograph;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const mediaItemSearchResult = await this.repositoryProvider
            .forResource<MediaItem>(AggregateType.mediaItem)
            .fetchMany();

        const allMediaItems = mediaItemSearchResult.filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            [AggregateType.mediaItem]: allMediaItems,
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        photo: Photograph,
        { resources: { mediaItem: mediaItems } }: InMemorySnapshot
    ): IPhotographViewModel {
        return new PhotographViewModel(photo, mediaItems);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Photograph];
    }
}
