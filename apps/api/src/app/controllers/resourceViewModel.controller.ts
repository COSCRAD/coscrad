import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { Book } from '../../domain/models/book/entities/book.entity';
import { Photograph } from '../../domain/models/photograph/entities/photograph.entity';
import { ISpatialFeature } from '../../domain/models/spatial-feature/ISpatialFeature';
import { Tag } from '../../domain/models/tag/tag.entity';
import { TranscribedAudio } from '../../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { isAggregateId } from '../../domain/types/AggregateId';
import { ResourceType } from '../../domain/types/ResourceType';
import { isInternalError } from '../../lib/errors/InternalError';
import { isNotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import buildBibliographicReferenceViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildBibliographicReferenceViewModels';
import buildBookViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildBookViewModels';
import buildPhotographViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildPhotographViewModels';
import buildSpatialFeatureViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildSpatialFeatureViewModels';
import buildTranscribedAudioViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildTranscribedAudioViewModels';
import {
    HasViewModelId,
    TagViewModel,
} from '../../view-models/buildViewModelForResource/viewModels';
import { BaseViewModel } from '../../view-models/buildViewModelForResource/viewModels/base.view-model';
import { BibliographicReferenceViewModel } from '../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { BookViewModel } from '../../view-models/buildViewModelForResource/viewModels/book.view-model';
import { PhotographViewModel } from '../../view-models/buildViewModelForResource/viewModels/photograph.view-model';
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
