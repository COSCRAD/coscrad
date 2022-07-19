import { Controller, Get, Param, Request, Res } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { BookQueryService } from '../../../domain/services/query-services/book-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { BookViewModel } from '../../../view-models/buildViewModelForResource/viewModels/book.view-model';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import buildByIdApiParamMetadata from './common/buildByIdApiParamMetadata';
import sendInternalResultAsHttpResponse from './common/sendInternalResultAsHttpResponse';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(`${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.book)}`)
export class BookController {
    constructor(private readonly bookQueryService: BookQueryService) {}

    // @ApiBearerAuth('JWT')
    // @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: BookViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Res() res, @Param('id') id: unknown) {
        const searchResult = await this.bookQueryService.fetchById(id, req.user || undefined);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    // @ApiBearerAuth('JWT')
    // @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() req) {
        console.log({
            userAtTop: req.user,
        });
        // TODO Eventually, we'll want to build the filter spec based on the user's role \ context
        return this.bookQueryService.fetchMany(req.user || undefined);
    }
}
