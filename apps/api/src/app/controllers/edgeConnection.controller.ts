import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { isDeepStrictEqual } from 'util';
import {
    EdgeConnection,
    EdgeConnectionType,
} from '../../domain/models/context/edge-connection.entity';
import { Resource } from '../../domain/models/resource.entity';
import { Tag } from '../../domain/models/tag/tag.entity';
import { isAggregateId } from '../../domain/types/AggregateId';
import { AggregateType } from '../../domain/types/AggregateType';
import { CategorizableType } from '../../domain/types/CategorizableType';
import { isResourceType, ResourceType } from '../../domain/types/ResourceType';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../types/ResultOrError';
import { NoteViewModel } from '../../view-models/edgeConnectionViewModels/note.view-model';
import formatResourceCompositeIdentifier from '../../view-models/presentation/formatAggregateCompositeIdentifier';
import { buildAllAggregateDescriptions } from '../../view-models/resourceDescriptions';
import httpStatusCodes from '../constants/httpStatusCodes';
import { NOTE_INDEX_ROUTE } from './constants';
import sendInternalResultAsHttpResponse from './resources/common/sendInternalResultAsHttpResponse';
import { mixLinkIntoViewModelDescription } from './utilities/mixLinkIntoViewModelDescription';
import mixTagsIntoViewModel from './utilities/mixTagsIntoViewModel';

@ApiTags('web of knowledge (edge connections)')
@Controller(NOTE_INDEX_ROUTE)
export class EdgeConnectionController {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        private configService: ConfigService
    ) {}

    @Get('')
    async getSchema() {
        const searchResult = buildAllAggregateDescriptions().find(
            ({ type }) => type === AggregateType.note
        );

        if (isNullOrUndefined(searchResult)) {
            throw new InternalError(`Failed to find a view model description for the note model`);
        }

        const result = mixLinkIntoViewModelDescription(
            this.configService.get<string>('GLOBAL_PREFIX')
        )(searchResult);

        return result;
    }

    @Get('notes')
    async fetchManyNotes(@Res() res) {
        const result = await this.repositoryProvider.getEdgeConnectionRepository().fetchMany();

        const errors = result.filter((result) => isInternalError(result));

        if (result.some(isInternalError))
            return res.status(httpStatusCodes.internalError).send({
                errors,
            });

        const edgeConnections = result as EdgeConnection[];

        const noteViewModels = edgeConnections.map(
            (edgeConnection) => new NoteViewModel(edgeConnection)
        );

        return await this.mixinTheTagsAndSend(res, noteViewModels);
    }

    @ApiQuery({
        name: 'type',
        enum: Object.values(ResourceType),
    })
    @Get('selfNotes')
    async fetchResourceSelfConnections(
        @Res() res,
        // be careful, these are actually unknown but Swagger uses this type for doc generation
        @Query('id') id: string,
        @Query('type') type: ResourceType
    ) {
        const resourceInstance = await this.fetchResourceContextInstance(id, type);

        if (isNotFound(resourceInstance) || isInternalError(resourceInstance))
            return sendInternalResultAsHttpResponse(res, resourceInstance);

        const result = await this.repositoryProvider.getEdgeConnectionRepository().fetchMany();

        const errors = result.filter(isInternalError);

        if (errors.length) return res.status(httpStatusCodes.badRequest).send({ errors });

        const allEdgeConnections = result as EdgeConnection[];

        const selfEdgeConnectionsForThisResource = allEdgeConnections.filter(
            ({ connectionType: edgeConnectionType, members }) =>
                edgeConnectionType === EdgeConnectionType.self &&
                isDeepStrictEqual(members[0].compositeIdentifier, { type, id })
        );

        const viewModels = selfEdgeConnectionsForThisResource.map(
            (connection) => new NoteViewModel(connection)
        );

        return await this.mixinTheTagsAndSend(res, viewModels);
    }

    @ApiQuery({
        name: 'type',
        enum: Object.values(ResourceType),
    })
    @Get('forResource')
    async fetchConnectionsForResource(
        @Res() res,
        // be careful, these are actually unknown but Swagger uses this type for doc generation
        @Query('id') id: string,
        @Query('type') type: string
    ) {
        const resourceInstance = await this.fetchResourceContextInstance(id, type);

        if (isNotFound(resourceInstance) || isInternalError(resourceInstance))
            return sendInternalResultAsHttpResponse(res, resourceInstance);

        const result = await this.repositoryProvider.getEdgeConnectionRepository().fetchMany();

        const errors = result.filter(isInternalError);

        if (errors.length) return res.status(httpStatusCodes.badRequest).send({ errors });

        const allDualEdgeConnections = (result as EdgeConnection[]).filter(
            ({ connectionType: type }) => type === EdgeConnectionType.dual
        );

        const dualEdgeConnectionsForThisResource = allDualEdgeConnections.filter(({ members }) =>
            members.some(({ compositeIdentifier }) =>
                isDeepStrictEqual(compositeIdentifier, { id, type })
            )
        );

        const viewModels = dualEdgeConnectionsForThisResource.map(
            (connection) => new NoteViewModel(connection)
        );

        return await this.mixinTheTagsAndSend(res, viewModels);
    }

    /**
     * The resource context instance is the resource (e.g. Book 123) whose notes
     * or connections we are querying.
     */
    private async fetchResourceContextInstance(
        id: string,
        type: string
    ): Promise<Maybe<ResultOrError<Resource>>> {
        if (!isAggregateId(id)) return new InternalError(`Invalid resource id: ${id}`);

        if (!isResourceType(type)) return new InternalError(`Invalid resource type: ${type}`);

        const resourceSearchResult = await this.repositoryProvider.forResource(type).fetchById(id);

        if (isInternalError(resourceSearchResult)) {
            throw new InternalError(
                `Encountered an error when fetching resources related to ${formatResourceCompositeIdentifier(
                    { id, type }
                )}`,
                [resourceSearchResult]
            );
        }

        if (isNotFound(resourceSearchResult) || !resourceSearchResult.published) return NotFound;

        return resourceSearchResult;
    }

    /**
     * TODO [DRY] This is the same as on
     * the `ResourceViewModelController` in `resourceViewModel.controller.ts`
     */
    private async mixinTheTagsAndSend(res, viewModel: NoteViewModel);
    private async mixinTheTagsAndSend(res, viewModels: NoteViewModel[]);
    private async mixinTheTagsAndSend(
        @Res() res,
        viewModelOrViewModels: NoteViewModel | NoteViewModel[]
    ) {
        const result = await this.repositoryProvider.getTagRepository().fetchMany();

        const invalidTagErrors = result.filter(isInternalError);

        if (invalidTagErrors.length > 0)
            res.status(httpStatusCodes.internalError).send(invalidTagErrors);

        const allTags = result as Tag[];

        const mixinTags = (viewModel: NoteViewModel) =>
            mixTagsIntoViewModel(viewModel, allTags, CategorizableType.note);

        const viewModelOrViewModelsWithTags = Array.isArray(viewModelOrViewModels)
            ? viewModelOrViewModels.map(mixinTags)
            : mixinTags(viewModelOrViewModels);

        res.status(httpStatusCodes.ok).send(cloneToPlainObject(viewModelOrViewModelsWithTags));
    }
}
