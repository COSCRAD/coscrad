import { IDetailQueryResult, MIMEType } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import {
    Controller,
    FileTypeValidator,
    Get,
    Param,
    ParseFilePipe,
    Post,
    Query,
    Request,
    Res,
    UploadedFiles,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { InternalErrorFilter } from '../../../../app/controllers/command/exception-handling/exception-filters/internal-error.filter';
import buildByIdApiParamMetadata from '../../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from '../../../../app/controllers/resources/common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from '../../../../app/controllers/resources/constants';
import { CoscradInvalidUserInputException } from '../../../../app/controllers/response-mapping/CoscradExceptions';
import { CoscradInvalidUserInputFilter } from '../../../../app/controllers/response-mapping/CoscradExceptions/exception-filters';
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
import {
    getExpectedMimeTypeFromExtension,
    getExtensionForMimeType,
} from '../entities/get-extension-for-mime-type';
import { MediaFileUploadResponse } from '../entities/media-file-upload-response';
import { SuccessfulMediaUploadRecord } from '../entities/successful-media-upload-record';
import { MediaItemQueryService } from './media-item-query.service';
import { MediaItemViewModel } from './media-item.view-model';

// TODO Make this configurable

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.mediaItem))
@UseFilters(new InternalErrorFilter(), new CoscradInvalidUserInputFilter())
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

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Post('/upload')
    @UseInterceptors(
        /**
         * Note that the configuration has already been set from the config using
         * `MulterModule.registerAsync()` at the level of the module.
         */
        AnyFilesInterceptor()
    )
    uploadFiles(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({
                        // This allows all MIME Types registered within COSCRAD
                        fileType: new RegExp(Object.values(MIMEType).join('|'), 'i'),
                    }),
                    // TODO validate content type against actual extension
                    // new CoscradBinaryFileTypeValidator({}),
                ],
                exceptionFactory: (msg: string) => {
                    const uploadError = new InternalError(
                        `Failed to upload media item. MIME Type is not allowed, or is inconsistent with content type`,
                        [new InternalError(msg)]
                    );

                    return new CoscradInvalidUserInputException(uploadError);
                },
            })
        )
        files: Array<Express.Multer.File>
    ) {
        const uploadedMediaFiles: SuccessfulMediaUploadRecord[] = files.map(
            ({ originalname, filename }) => {
                const filenameSplit = originalname.split('.');

                // account for filenames with `.` in the name portion of the file (xxx.xx.xx.pdf)
                // there are built-in Nest JS validators in the Interceptor we could use
                const extension = filenameSplit.pop();

                const name = filenameSplit.join('_');

                return new SuccessfulMediaUploadRecord({
                    uploadedFilename: name,
                    systemFilename: filename,
                    /**
                     * TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-283]
                     *  Should we use the `browserMimeType` property from `file` (`Multer.File`)?
                     * Let's ensure that all possible `MIMETypes` (from browser, from extension, from content)
                     * are mutually consistent.
                     */
                    mimeType: getExpectedMimeTypeFromExtension(extension),
                });
            }
        );

        const mediaFileUploadResponse = new MediaFileUploadResponse({
            uploadedMediaFiles,
        });

        return mediaFileUploadResponse;
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
