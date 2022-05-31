import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { isDeepStrictEqual } from 'util';
import {
    EdgeConnection,
    EdgeConnectionType,
} from '../../domain/models/context/edge-connection.entity';
import { Tag } from '../../domain/models/tag/tag.entity';
import { isAggregateId } from '../../domain/types/AggregateId';
import { CategorizableType } from '../../domain/types/CategorizableType';
import { isResourceType, ResourceType } from '../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import { NoteViewModel } from '../../view-models/edgeConnectionViewModels/note.view-model';
import httpStatusCodes from '../constants/httpStatusCodes';
import mixTagsIntoViewModel from './utilities/mixTagsIntoViewModel';

@ApiTags('connections')
@Controller('connections')
export class EdgeConnectionController {
    constructor(private readonly repositoryProvider: RepositoryProvider) {}

    @Get('')
    async getStats() {
        const count = await this.repositoryProvider.getEdgeConnectionRepository().getCount();

        return {
            count,
        };
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
        if (!isAggregateId(id))
            return res
                .status(httpStatusCodes.badRequest)
                .send(new InternalError(`Invalid resource id: ${id}`));

        if (!isResourceType(type))
            return res
                .status(httpStatusCodes.badRequest)
                .send(new InternalError(`Invalid resource type: ${type}`));

        const result = await this.repositoryProvider.getEdgeConnectionRepository().fetchMany();

        const errors = result.filter(isInternalError);

        if (errors.length) return res.status(httpStatusCodes.badRequest).send({ errors });

        const allEdgeConnections = result as EdgeConnection[];

        const selfEdgeConnectionsForThisResource = allEdgeConnections.filter(
            ({ type: edgeConnectionType, members }) =>
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
        if (!isAggregateId(id))
            return res
                .status(httpStatusCodes.badRequest)
                .send(new InternalError(`Invalid resource id: ${id}`));

        if (!isResourceType(type))
            return res
                .status(httpStatusCodes.badRequest)
                .send(new InternalError(`Invalid resource type: ${type}`));

        const result = await this.repositoryProvider.getEdgeConnectionRepository().fetchMany();

        const errors = result.filter(isInternalError);

        if (errors.length) return res.status(httpStatusCodes.badRequest).send({ errors });

        const allDualEdgeConnections = (result as EdgeConnection[]).filter(
            ({ type }) => type === EdgeConnectionType.dual
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
