import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { Tag } from '../../domain/models/tag/tag.entity';
import { isAggregateId } from '../../domain/types/AggregateId';
import { ResourceType } from '../../domain/types/ResourceType';
import { isInternalError } from '../../lib/errors/InternalError';
import { isNotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import buildBibliographicReferenceViewModels from '../../view-models/buildViewModelForResource/viewModelBuilders/buildBibliographicReferenceViewModels';
import { HasViewModelId } from '../../view-models/buildViewModelForResource/viewModels';
import { BaseViewModel } from '../../view-models/buildViewModelForResource/viewModels/base.view-model';
import { BibliographicReferenceViewModel } from '../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
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
