import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { isDeepStrictEqual } from 'util';
import {
    EdgeConnection,
    EdgeConnectionType,
} from '../../domain/models/context/edge-connection.entity';
import { isResourceId } from '../../domain/types/ResourceId';
import { isResourceType, ResourceType, resourceTypes } from '../../domain/types/resourceTypes';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import { NoteViewModel } from '../../view-models/edgeConnectionViewModels/note.view-model';
import httpStatusCodes from '../constants/httpStatusCodes';

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

        return res.status(httpStatusCodes.ok).send(noteViewModels.map(cloneToPlainObject));
    }

    @ApiQuery({
        name: 'type',
        enum: Object.values(resourceTypes),
    })
    @Get('selfNotes')
    async fetchResourceSelfConnections(
        @Res() res,
        // be careful, these are actually unknown but Swagger uses this type for doc generation
        @Query('id') id: string,
        @Query('type') type: ResourceType
    ) {
        if (!isResourceId(id))
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

        res.status(httpStatusCodes.ok).send(
            cloneToPlainObject(
                selfEdgeConnectionsForThisResource.map(
                    (connection) => new NoteViewModel(connection)
                )
            )
        );
    }

    @ApiQuery({
        name: 'type',
        enum: Object.values(resourceTypes),
    })
    @Get('forResource')
    async fetchConnectionsForResource(
        @Res() res,
        // be careful, these are actually unknown but Swagger uses this type for doc generation
        @Query('id') id: string,
        @Query('type') type: string
    ) {
        if (!isResourceId(id))
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

        return res
            .status(httpStatusCodes.ok)
            .send(
                cloneToPlainObject(
                    dualEdgeConnectionsForThisResource.map(
                        (connection) => new NoteViewModel(connection)
                    )
                )
            );
    }
}
