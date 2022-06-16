import { Controller, Get, Injectable, Param, Res } from '@nestjs/common';
import { ApiOkResponse, ApiParam } from '@nestjs/swagger';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { BookQueryService } from '../../../domain/services/query-services/book-query.service';
import { ResourceType } from '../../../domain/types/ResourceType';
import { BookViewModel } from '../../../view-models/buildViewModelForResource/viewModels/book.view-model';
import { buildByIdApiParamMetadata, RESOURCES_ROUTE_PREFIX } from '../resourceViewModel.controller';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import sendInternalResultAsHttpResponse from './sendInternalResultAsHttpResponse';

@Injectable()
@Controller(`${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(ResourceType.book)}`)
export class BookController {
    constructor(private readonly bookQueryService: BookQueryService) {}

    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: BookViewModel })
    @Get(`/:id`)
    async fetchById(@Res() res, @Param('id') id: unknown) {
        const searchResult = await this.bookQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, searchResult);
    }

    @Get('')
    async fetchMany() {
        // TODO Eventually, we'll want to build the filter spec based on the user's role \ context
        return this.bookQueryService.fetchMany(new IsPublished(true));
    }
}
