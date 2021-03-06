import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Tag } from '../../domain/models/tag/tag.entity';
import { Term } from '../../domain/models/term/entities/term.entity';
import { VocabularyList } from '../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { isEntityId } from '../../domain/types/EntityId';
import { entityTypes } from '../../domain/types/entityTypes';
import { isInternalError } from '../../lib/errors/InternalError';
import { isNotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import buildTagViewModels from '../../view-models/buildViewModelForEntity/viewModelBuilders/buildTagViewModels';
import buildTermViewModels from '../../view-models/buildViewModelForEntity/viewModelBuilders/buildTermViewModels';
import buildVocabularyListViewModels from '../../view-models/buildViewModelForEntity/viewModelBuilders/buildVocabularyListViewModels';
import {
    HasViewModelId,
    TagViewModel,
    TermViewModel,
    VocabularyListViewModel,
} from '../../view-models/buildViewModelForEntity/viewModels';
import { buildAllEntityDescriptions } from '../../view-models/entityDescriptions/buildAllEntityDescriptions';
import httpStatusCodes from '../constants/httpStatusCodes';
import buildViewModelPathForEntityType from './utilities/buildViewModelPathForEntityType';

const buildByIdApiParamMetadata = () => ({
    name: 'id',
    required: true,
    example: '2',
});

@ApiTags('entities')
@Controller('entities')
export class EntityViewModelController {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        private readonly configService: ConfigService
    ) {}

    @Get('')
    getAllEntityDescriptions() {
        return buildAllEntityDescriptions();
    }

    /* ********** TERMS ********** */
    @ApiOkResponse({ type: TermViewModel, isArray: true })
    @Get(buildViewModelPathForEntityType(entityTypes.term))
    async fetchTerms(@Res() res) {
        const allTermViewModels = await buildTermViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allTermViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allTermViewModels),
            });

        return res.status(httpStatusCodes.ok).send(allTermViewModels.map(cloneToPlainObject));
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: TermViewModel })
    @Get(`${buildViewModelPathForEntityType(entityTypes.term)}/:id`)
    async fetchTermById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isEntityId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forEntity<Term>(entityTypes.term)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const termViewModel = new TermViewModel(
            searchResult,
            this.configService.get<string>('BASE_AUDIO_URL')
        );

        const dto = cloneToPlainObject(termViewModel);

        return res.status(httpStatusCodes.ok).send(dto);
    }

    /* ********** VOCABULARY LISTS ********** */
    @ApiOkResponse({ type: VocabularyListViewModel, isArray: true })
    @Get(buildViewModelPathForEntityType(entityTypes.vocabularyList))
    async fetchVocabularyLists(@Res() res) {
        const allViewModels = await buildVocabularyListViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return res.status(httpStatusCodes.ok).send(allViewModels.map(cloneToPlainObject));
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: VocabularyListViewModel })
    @Get(`${buildViewModelPathForEntityType(entityTypes.vocabularyList)}/:id`)
    async fetchVocabularyListById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isEntityId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        // TODO break this out to a separate helper, it doesn't belong in the controller

        const [vocabularyListSearchResult, allTerms] = await Promise.all([
            this.repositoryProvider
                .forEntity<VocabularyList>(entityTypes.vocabularyList)
                .fetchById(id),
            this.repositoryProvider
                .forEntity<Term>(entityTypes.term)
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
            this.configService.get<string>('BASE_AUDIO_URL')
        );

        const dto = cloneToPlainObject(viewModel);

        return res.status(httpStatusCodes.ok).send(dto);
    }

    /* ********** TAGS ********** */
    @ApiOkResponse({ type: TagViewModel, isArray: true })
    @Get(buildViewModelPathForEntityType(entityTypes.tag))
    async fetchTags(@Res() res) {
        const allViewModels = await buildTagViewModels({
            repositoryProvider: this.repositoryProvider,
            configService: this.configService,
        });

        if (isInternalError(allViewModels))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(allViewModels),
            });

        return res.status(httpStatusCodes.ok).send(allViewModels.map(cloneToPlainObject));
    }

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: TagViewModel })
    @Get(`${buildViewModelPathForEntityType(entityTypes.tag)}/:id`)
    async fetchTagById(@Res() res, @Param() params: unknown) {
        const { id } = params as HasViewModelId;

        if (!isEntityId(id))
            return res.status(httpStatusCodes.badRequest).send({
                error: `Invalid input for id: ${id}`,
            });

        const searchResult = await this.repositoryProvider
            .forEntity<Tag>(entityTypes.tag)
            .fetchById(id);

        if (isInternalError(searchResult))
            return res.status(httpStatusCodes.internalError).send({
                error: JSON.stringify(searchResult),
            });

        if (isNotFound(searchResult)) return res.status(httpStatusCodes.notFound).send();

        if (!searchResult.published) return res.status(httpStatusCodes.notFound).send();

        const viewModel = new TagViewModel(searchResult);

        const dto = cloneToPlainObject(viewModel);

        return res.status(httpStatusCodes.ok).send(dto);
    }
}
