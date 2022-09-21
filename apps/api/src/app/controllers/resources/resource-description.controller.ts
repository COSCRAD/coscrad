import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { isResourceType } from '../../../domain/types/ResourceType';
import { buildAllAggregateDescriptions } from '../../../view-models/resourceDescriptions/buildAllAggregateDescriptions';
import { AggregateInfo } from '../../../view-models/resourceDescriptions/types/AggregateInfo';
import { mixLinkIntoViewModelDescription } from '../utilities';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(RESOURCES_ROUTE_PREFIX)
export class ResourceDescriptionController {
    constructor(private readonly configService: ConfigService) {}

    @Get('')
    getAllResourceDescriptions(): (AggregateInfo & { link: string })[] {
        const APP_GLOBAL_PREFIX = this.configService.get<string>('GLOBAL_PREFIX');

        const resourceInfos = buildAllAggregateDescriptions();

        return resourceInfos
            .filter(({ type }) => isResourceType(type))
            .map(mixLinkIntoViewModelDescription(APP_GLOBAL_PREFIX));
    }
}
