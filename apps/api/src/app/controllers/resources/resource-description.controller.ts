import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { isResourceType } from '../../../domain/types/ResourceType';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { buildAllResourceDescriptions } from '../../../view-models/resourceDescriptions/buildAllResourceDescriptions';
import { AggregateInfo } from '../../../view-models/resourceDescriptions/types/AggregateInfo';
import { buildIndexPathForAggregate } from '../utilities/buildIndexPathForAggregate';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(RESOURCES_ROUTE_PREFIX)
export class ResourceDescriptionController {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        private readonly configService: ConfigService
    ) {}

    @Get('')
    getAllResourceDescriptions(): (AggregateInfo & { link: string })[] {
        const APP_GLOBAL_PREFIX = this.configService.get<string>('GLOBAL_PREFIX');

        const buildLink = (route: string) => `/${APP_GLOBAL_PREFIX}/${route}`;

        const resourceInfos = buildAllResourceDescriptions();

        return resourceInfos
            .filter(({ type }) => isResourceType(type))
            .map((resourceInfo) => ({
                ...resourceInfo,
                link: buildLink(buildIndexPathForAggregate(resourceInfo.type)),
            }));
    }
}
