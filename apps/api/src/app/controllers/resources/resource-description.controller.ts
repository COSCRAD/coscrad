import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { buildAllResourceDescriptions } from '../../../view-models/resourceDescriptions/buildAllResourceDescriptions';
import { RESOURCES_ROUTE_PREFIX } from './constants';

@ApiTags(RESOURCES_ROUTE_PREFIX)
@Controller(RESOURCES_ROUTE_PREFIX)
export class ResourceDescriptionController {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        private readonly configService: ConfigService
    ) {}

    @Get('')
    getAllResourceDescriptions() {
        const appGlobalPrefix = this.configService.get<string>('GLOBAL_PREFIX');

        const fullResourcesBasePath = `/${appGlobalPrefix}/${RESOURCES_ROUTE_PREFIX}`;

        return buildAllResourceDescriptions(fullResourcesBasePath);
    }
}
