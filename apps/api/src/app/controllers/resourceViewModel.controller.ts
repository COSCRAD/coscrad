import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { Book } from '../../domain/models/book/entities/book.entity';
import { Photograph } from '../../domain/models/photograph/entities/photograph.entity';
import { Song } from '../../domain/models/song/song.entity';
import { ISpatialFeature } from '../../domain/models/spatial-feature/ISpatialFeature';
import { Tag } from '../../domain/models/tag/tag.entity';
import { Term } from '../../domain/models/term/entities/term.entity';
import { TranscribedAudio } from '../../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { VocabularyList } from '../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { isAggregateId } from '../../domain/types/AggregateId';
import { ResourceType } from '../../domain/types/ResourceType';
import { isInternalError } from '../../lib/errors/InternalError';
import { isNotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import buildBibliographicReferenceViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildBibliographicReferenceViewModels';
import buildBookViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildBookViewModels';
import buildPhotographViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildPhotographViewModels';
import buildSongViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildSongViewModels';
import buildSpatialFeatureViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildSpatialFeatureViewModels';
import buildTermViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildTermViewModels';
import buildTranscribedAudioViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildTranscribedAudioViewModels';
import buildVocabularyListViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildVocabularyListViewModels';
import {
    HasViewModelId,
    TagViewModel,
    TermViewModel,
    VocabularyListViewModel,
} from '../../view-models/buildViewModelForResource/viewModels';
import { BaseViewModel } from '../../view-models/buildViewModelForResource/viewModels/base.view-model';
import { BibliographicReferenceViewModel } from '../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { BookViewModel } from '../../view-models/buildViewModelForResource/viewModels/book.view-model';
import { PhotographViewModel } from '../../view-models/buildViewModelForResource/viewModels/photograph.view-model';
import { SongViewModel } from '../../view-models/buildViewModelForResource/viewModels/song.view-model';
import { SpatialFeatureViewModel } from '../../view-models/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { TranscribedAudioViewModel } from '../../view-models/buildViewModelForResource/viewModels/transcribed-audio/transcribed-audio.view-model';
import { buildAllResourceDescriptions } from '../../view-models/resourceDescriptions/buildAllResourceDescriptions';
import httpStatusCodes from '../constants/httpStatusCodes';
import buildViewModelPathForResourceType from './utilities/buildViewModelPathForResourceType';
import mixTagsIntoViewModel from './utilities/mixTagsIntoViewModel';

export const buildByIdApiParamMetadata = () => ({
    name: 'id',
    required: true,
    example: '2',
});

export const RESOURCES_ROUTE_PREFIX = 'resources';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(RESOURCES_ROUTE_PREFIX)
export class ResourceViewModelController {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        private readonly configService: ConfigService
    ) {}

    @Get('')
    getAllResourceDescriptions() {
        const appGlobalPrefix = this.configService.get<string>('GLOBAL_PREFIX');

        const fullResourcesBasePath = `/${appGlobalPrefix}/${RESOURCES_ROUTE_PREFIX}`;

        return buildAllResourceDescriptions(fullResourcesBasePath);
    }

    /* ********** TERMS ********** */
    @ApiOkResponse({ type: TermViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.term))
    async fetchTerms(@Res() res) {
        const allTermViewModels = await buildTermViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allTermViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allTermViewModels),
            });

        return await this.mixinTheTagsAndSend(res, allTermViewModels, ResourceType.term);
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: TermViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.term)}/:id`)
    async fetchTermById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forResource<Term>(ResourceType.term)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const termViewModel = new TermViewModel(
            searchResult,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );

        return this.mixinTheTagsAndSend(res, termViewModel, ResourceType.term);
    }

    /* ********** VOCABULARY LISTS ********** */
    @ApiOkResponse({ type: VocabularyListViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.vocabularyList))
    async fetchVocabularyLists(@Res() res) {
        const allViewModels = await buildVocabularyListViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return await this.mixinTheTagsAndSend(res, allViewModels, ResourceType.vocabularyList);
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: VocabularyListViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.vocabularyList)}/:id`)
    async fetchVocabularyListById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        // TODO break this out to a separate helper, it doesn't belong in the controller

        const [vocabularyListSearchResult, allTerms] = await Promise.all([
            this.repositoryProvider
                .forResource<VocabularyList>(ResourceType.vocabularyList)
                .fetchById(id),
            this.repositoryProvider
                .forResource<Term>(ResourceType.term)
                .fetchMany()
                .then((allResults) =>
                    allResults.filter((result): result is Term => !isInternalError(result))
                ),
        ]);

        if (isInternalError(vocabularyListSearchResult)) {
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(vocabularyListSearchResult),
            });
        }

        if (isNotFound(vocabularyListSearchResult))
            return res.status(httpStatusCodes.notFound).send();

        if (!vocabularyListSearchResult.published)
            return res.status(httpStatusCodes.notFound).send();

        const viewModel = new VocabularyListViewModel(
            vocabularyListSearchResult,
            allTerms,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );

        return this.mixinTheTagsAndSend(res, viewModel, ResourceType.vocabularyList);
    }

    /* ********** TRANSCRIBED AUDIO ********** */
    @ApiOkResponse({ type: TranscribedAudioViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.transcribedAudio))
    async fetchAudioViewModelsWithTranscripts(@Res() res) {
        const allViewModels = await buildTranscribedAudioViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return await this.mixinTheTagsAndSend(res, allViewModels, ResourceType.transcribedAudio);
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: TagViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.transcribedAudio)}/:id`)
    async fetchTranscribedAudioById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forResource<TranscribedAudio>(ResourceType.transcribedAudio)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const viewModel = new TranscribedAudioViewModel(
            searchResult,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );

        return await this.mixinTheTagsAndSend(res, viewModel, ResourceType.transcribedAudio);
    }

    /* ********** BOOKS ********** */
    @ApiOkResponse({ type: BookViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.book))
    async fetchBooks(@Res() res) {
        const allViewModels = await buildBookViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return await this.mixinTheTagsAndSend(res, allViewModels, ResourceType.book);
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: BookViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.book)}/:id`)
    async fetchBookById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forResource<Book>(ResourceType.book)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const viewModel = new BookViewModel(searchResult);

        return await this.mixinTheTagsAndSend(res, viewModel, ResourceType.book);
    }

    /* ********** PHOTOGRAPHS   ********** */
    @ApiOkResponse({ type: PhotographViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.photograph))
    async fetchPhotographs(@Res() res) {
        const allViewModels = await buildPhotographViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return await this.mixinTheTagsAndSend(res, allViewModels, ResourceType.photograph);
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: PhotographViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.photograph)}/:id`)
    async fetchPhotographById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forResource<Photograph>(ResourceType.photograph)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const viewModel = new PhotographViewModel(
            searchResult,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );

        return await this.mixinTheTagsAndSend(res, viewModel, ResourceType.photograph);
    }

    /* ********** SPATIAL FEATURE   ********** */
    @ApiOkResponse({ type: SpatialFeatureViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.spatialFeature))
    async fetchSpatialFeatures(@Res() res) {
        const allViewModels = await buildSpatialFeatureViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return await this.mixinTheTagsAndSend(res, allViewModels, ResourceType.spatialFeature);
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: SpatialFeatureViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.spatialFeature)}/:id`)
    async fetchSpatialFeatureById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forResource<ISpatialFeature>(ResourceType.spatialFeature)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const viewModel = new SpatialFeatureViewModel(searchResult);

        return await this.mixinTheTagsAndSend(res, viewModel, ResourceType.spatialFeature);
    }

    /* ********** BIBLIOGRAPHIC REFERENCE  ********** */
    @ApiOkResponse({ type: BibliographicReferenceViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.bibliographicReference))
    async fetchBibliographicReferences(@Res() res) {
        const allViewModels = await buildBibliographicReferenceViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return await this.mixinTheTagsAndSend(
            res,
            allViewModels,
            ResourceType.bibliographicReference
        );
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: BibliographicReferenceViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.bibliographicReference)}/:id`)
    async fetchBibliographicReferenceById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forResource<IBibliographicReference>(ResourceType.bibliographicReference)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const viewModel = new BibliographicReferenceViewModel(searchResult);

        return await this.mixinTheTagsAndSend(res, viewModel, ResourceType.bibliographicReference);
    }

    /* ********** SONGS ********** */
    @ApiOkResponse({ type: SongViewModel, isArray: true })
    @Get(buildViewModelPathForResourceType(ResourceType.song))
    async fetchSongs(@Res() res) {
        const allViewModels = await buildSongViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        await this.mixinTheTagsAndSend(res, allViewModels, ResourceType.song);
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: SongViewModel })
    @Get(`${buildViewModelPathForResourceType(ResourceType.song)}/:id`)
    async fetchSongById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isAggregateId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forResource<Song>(ResourceType.song)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: searchResult.toString(),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const viewModel = new SongViewModel(searchResult);

        await this.mixinTheTagsAndSend(res, viewModel, ResourceType.song);
    }

    /**
     * TODO [DRY] This is the same as on
     * the `ResourceViewModelController` in `resourceViewModel.controller.ts`
     */
    private async mixinTheTagsAndSend(res, viewModel: BaseViewModel, resourceType: ResourceType);
    private async mixinTheTagsAndSend(res, viewModels: BaseViewModel[], resourceType: ResourceType);
    private async mixinTheTagsAndSend(
        @Res() res,
        viewModelOrViewModels: BaseViewModel | BaseViewModel[],
        resourceType: ResourceType
    ) {
        const result = await this.repositoryProvider.getTagRepository().fetchMany();

        const invalidTagErrors = result.filter(isInternalError);

        if (invalidTagErrors.length > 0)
            res.status(httpStatusCodes.internalError).send(invalidTagErrors);

        const allTags = result as Tag[];

        const mixinTags = (viewModel: BaseViewModel) =>
            mixTagsIntoViewModel(viewModel, allTags, resourceType);

        const viewModelOrViewModelsWithTags = Array.isArray(viewModelOrViewModels)
            ? viewModelOrViewModels.map(mixinTags)
            : mixinTags(viewModelOrViewModels);

        res.status(httpStatusCodes.ok).send(cloneToPlainObject(viewModelOrViewModelsWithTags));
    }
}
