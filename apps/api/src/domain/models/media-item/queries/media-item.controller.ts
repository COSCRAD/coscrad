import { IDetailQueryResult, MIMEType } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Controller, Get, Param, Query, Request, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { InternalErrorFilter } from '../../../../app/controllers/command/exception-handling/exception-filters/internal-error.filter';
import buildByIdApiParamMetadata from '../../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from '../../../../app/controllers/resources/common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from '../../../../app/controllers/resources/constants';
import buildViewModelPathForResourceType from '../../../../app/controllers/utilities/buildIndexPathForResourceType';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import clonePlainObjectWithoutProperty from '../../../../lib/utilities/clonePlainObjectWithoutProperty';
import { ResourceType } from '../../../types/ResourceType';
import { isAudioMimeType } from '../../audio-visual/audio-item/entities/audio-item.entity';
import { isVideoMimeType } from '../../audio-visual/video/entities/video.entity';
import { isPhotographMimeType } from '../../photograph/entities/photograph.entity';
import { getExtensionForMimeType } from '../entities/get-extension-for-mime-type';
import { MediaItemQueryService } from './media-item-query.service';
import { MediaItemViewModel } from './media-item.view-model';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.mediaItem))
@UseFilters(new InternalErrorFilter())
export class MediaItemController {
    constructor(private readonly mediaItemQueryService: MediaItemQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('/download/:id')
    /**
     * TODO Move this logic to the service layer.
     */
    async fetchBinary(@Request() req, @Res() res, @Param('id') id: unknown) {
        // TODO validation pipe
        // TODO SSOT for by-id query params
        if (!isNonEmptyString(id)) {
            return new InternalError(`Invalid request paramter: id must consist of non-empty text`);
        }

        const filePathSearchResult = await this.mediaItemQueryService.fetchFilepathForMediaItem(
            req?.user,
            id
        );

        if (isInternalError(filePathSearchResult) || isNotFound(filePathSearchResult))
            return sendInternalResultAsHttpResponse(res, filePathSearchResult);

        const options = {
            // TODO make this configurable
            root: filePathSearchResult.root,
            dotfiles: 'deny',
            headers: this.buildHeaders({
                mimeType: filePathSearchResult.mimeType,
                name: filePathSearchResult.filename,
            }),
        };

        return res.sendFile(filePathSearchResult.filepath, options);
    }

    // /download?name=C1
    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get(`/download`)
    async fetchBinaryByName(@Request() req, @Res() res, @Query('name') name) {
        if (!isNonEmptyString(name)) {
            return sendInternalResultAsHttpResponse(
                res,
                new InternalError(`name must be a non-empty string`)
            );
        }

        const searchResult = (await this.mediaItemQueryService.fetchByName(
            name,
            req.user || undefined
            // note filepath is a hidden implementation detail that isn't exposed to the user
        )) as unknown as IDetailQueryResult<MediaItemViewModel>;

        if (isInternalError(searchResult)) {
            throw new InternalError(`failed to fetch binary for media item with name: ${name}`, [
                searchResult,
            ]);
        }

        if (isNotFound(searchResult)) {
            // Why do we need to do this explicitly?
            return sendInternalResultAsHttpResponse(res, NotFound);
        }

        // TODO share this logic with the fetch binary method
        const filePath = await this.mediaItemQueryService.fetchFilepathForMediaItem(
            req?.user,
            searchResult.id
        );

        if (isInternalError(filePath) || isNotFound(filePath)) {
            return filePath;
        }

        const headers = this.buildHeaders({ mimeType: filePath.mimeType, name: filePath.filename });

        const options = {
            root: filePath.root,
            dotfiles: 'deny',
            headers,
        };

        return res.sendFile(filePath.filepath, options);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: MediaItemViewModel })
    @Get('/:id')
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.mediaItemQueryService.fetchById(id, req.user || undefined);

        const result =
            isNotFound(searchResult) || isInternalError(searchResult)
                ? searchResult
                : clonePlainObjectWithoutProperty(
                      // @ts-expect-error fix this
                      searchResult,
                      'filepath'
                  );

        return sendInternalResultAsHttpResponse(res, result);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        const result = await this.mediaItemQueryService.fetchMany(req.user || undefined);

        const entities = result.entities.map((entity) =>
            clonePlainObjectWithoutProperty(
                entity as unknown as Record<string, unknown>,
                'filepath'
            )
        );

        return clonePlainObjectWithOverrides(result, { entities });
    }

    private buildHeaders({
        mimeType,
        name,
    }: {
        mimeType: MIMEType;
        name: string;
    }): Record<string, unknown> {
        const disposition =
            isPhotographMimeType(mimeType) || isAudioMimeType(mimeType) || isVideoMimeType(mimeType)
                ? `inline`
                : `attachment; filename="${name}.${getExtensionForMimeType(mimeType)}"`;

        return {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'Content-Type': mimeType,
            'Content-Disposition': disposition,
        };
    }
}
