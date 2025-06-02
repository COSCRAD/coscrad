import {
    Controller,
    Get,
    NotImplementedException,
    Param,
    Request,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import buildByIdApiParamMetadata from '../../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import { RESOURCES_ROUTE_PREFIX } from '../../../../app/controllers/resources/constants';
import { QueryResponseTransformInterceptor } from '../../../../app/controllers/response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../../../../app/controllers/response-mapping/CoscradExceptions/exception-filters';
import buildViewModelPathForResourceType from '../../../../app/controllers/utilities/buildIndexPathForResourceType';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { StateBasedAudioItemViewModel } from '../../../../queries/buildViewModelForResource/viewModels/audio-visual/audio-item.view-model.state-based';
import { AudioItemQueryService } from '../../../services/query-services/audio-item-query.service';
import { ResourceType } from '../../../types/ResourceType';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(buildViewModelPathForResourceType(ResourceType.audioItem))
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class AudioItemController {
    constructor(private readonly audioItemQueryService: AudioItemQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @ApiOkResponse({ type: StateBasedAudioItemViewModel })
    @Get(`/:id`)
    async fetchById(@Request() req, @Param('id') id: string) {
        return this.audioItemQueryService.fetchById(id, req.user || undefined);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('')
    async fetchMany(@Request() _req) {
        throw new NotImplementedException('Controller.fetchMany');
    }

    // This is an interesting feature, but requires us to inject access to the domain database.
    // @ApiBearerAuth('JWT')
    // @UseGuards(AdminJwtGuard)
    // @Post('validate')
    // async validate(@Request() req, @Res() res) {
    //     const result = await this.audioItemQueryService.validate(req.user || undefined);

    //     if (isNotFound(result)) return res.status(httpStatusCodes.notFound).send();

    //     return res.status(httpStatusCodes.ok).send(result);
    // }
}
