import { Inject, Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { VocabularyListViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { AudioItem } from '../../models/audio-visual/audio-item/entities/audio-item.entity';
import BaseDomainModel from '../../models/base-domain-model.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { Term } from '../../models/term/entities/term.entity';
import { VocabularyList } from '../../models/vocabulary-list/entities/vocabulary-list.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import IsPublished from '../../repositories/specifications/is-published.specification';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class VocabularyListQueryService extends ResourceQueryService<
    VocabularyList,
    VocabularyListViewModel
> {
    protected readonly type = ResourceType.vocabularyList;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(
        vocabularyList: VocabularyList,
        {
            resources: { term: allTerms, audioItem: allAudioItems, mediaItem: allMediaItems },
            contributor: allContributors,
        }: InMemorySnapshot
    ): VocabularyListViewModel {
        return new VocabularyListViewModel(
            vocabularyList,
            allTerms,
            allAudioItems,
            allMediaItems,
            allContributors
        );
    }

    override async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [allTags, allTerms, allAudioItems, allMediaItems, allContributors] =
            await Promise.all([
                this.repositoryProvider.getTagRepository().fetchMany(),
                this.repositoryProvider
                    .forResource<Term>(ResourceType.term)
                    .fetchMany(new IsPublished(true)),
                this.repositoryProvider.forResource<AudioItem>(ResourceType.audioItem).fetchMany(),
                this.repositoryProvider.forResource<MediaItem>(ResourceType.mediaItem).fetchMany(),
                this.repositoryProvider.getContributorRepository().fetchMany(),
            ]);

        return new DeluxeInMemoryStore({
            tag: allTags.filter(validAggregateOrThrow),
            contributor: allContributors.filter(validAggregateOrThrow),
            resources: {
                term: allTerms.filter(validAggregateOrThrow),
                audioItem: allAudioItems.filter(validAggregateOrThrow),
                mediaItem: allMediaItems.filter(validAggregateOrThrow),
            },
        }).fetchFullSnapshotInLegacyFormat();
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [VocabularyList];
    }
}
