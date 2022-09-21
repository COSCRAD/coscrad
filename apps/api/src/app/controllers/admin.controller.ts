import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { isCategorizableType } from '../../domain/types/CategorizableType';
import { buildAllAggregateDescriptions } from '../../view-models/resourceDescriptions';
import { ADMIN_BASE_ROUTE, SWAGGER_TAG_ADMIN } from './constants';
import { mixLinkIntoViewModelDescription } from './utilities';

@ApiTags(SWAGGER_TAG_ADMIN)
@Controller(ADMIN_BASE_ROUTE)
export class AdminController {
    constructor(private configService: ConfigService) {}

    @Get('')
    async getSchemas() {
        return buildAllAggregateDescriptions()
            .filter(({ type }) => !isCategorizableType(type))
            .map(mixLinkIntoViewModelDescription(this.configService.get<string>('GLOBAL_PREFIX')));
    }
}
