import { AggregateType, ITermViewModel } from '@coscrad/api-interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { TermViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import BaseDomainModel from '../../models/BaseDomainModel';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { Term } from '../../models/term/entities/term.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class TermQueryService extends ResourceQueryService<Term, ITermViewModel> {
    protected readonly type = ResourceType.term;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        /**
         * TODO If we continue to do joins this way, we should inject the aggregate(s)
         * into this method and fetch all its references via `buildReferenceTree`
         * and fetch only what we need from the database. This is especially true
         * for `fetchById`.
         *
         * But we anticipate asynchronously event-sourcing and caching views
         * very soon.
         */
        const [allAudioItems, allMediaItems] = await Promise.all([
            this.repositoryProvider.forResource(ResourceType.audioItem).fetchMany(),
            this.repositoryProvider.forResource(ResourceType.mediaItem).fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            [AggregateType.audioItem]: allAudioItems.filter(validAggregateOrThrow),
            [AggregateType.mediaItem]: allMediaItems.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        term: Term,
        { resources: { audioItem: allAudioItems, mediaItem: allMediaItems } }: InMemorySnapshot
    ) {
        return new TermViewModel(term, allAudioItems, allMediaItems);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Term];
    }
}
