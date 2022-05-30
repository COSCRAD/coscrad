import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { MediaItemQueryService } from '../../../domain/services/media-item-query.service';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { MediaItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/media-item.view-model';
import { buildByIdApiParamMetadata, RESOURCES_ROUTE_PREFIX } from '../resourceViewModel.controller';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(
    `${RESOURCES_ROUTE_PREFIX}/${buildViewModelPathForResourceType(resourceTypes.mediaItem)}`
)
export class MediaItemController {
    constructor(private mediaItemQueryService: MediaItemQueryService) {}
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: MediaItemViewModel })
    @Get('/:id')
    fetchById(@Param('id') id: unknown) {
        return this.mediaItemQueryService.fetchById(id);
    }

    @Get('')
    fetchMany() {
        return this.mediaItemQueryService.fetchMany();
    }
}
