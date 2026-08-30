import { Body, Controller, Get, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../authorization/optional-jwt-auth-guard';
import { LanguageHubConfig } from '../../domain/site-configuration/models/language-hub-config';
import { SiteConfigurationService } from '../../domain/site-configuration/services/site-config.service';
import { AdminJwtGuard } from './command/command.controller';
import buildByIdApiParamMetadata from './resources/common/buildByIdApiParamMetadata';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from './response-mapping/CoscradExceptions/exception-filters';

@ApiTags('config')
@Controller('site-config')
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
export class SiteConfigurationController {
    constructor(private readonly languageHubConfigService: SiteConfigurationService) {}

    // use admin route guards and include unauthenticated test cases
    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('')
    async create(@Body() newConfig: LanguageHubConfig) {
        return this.languageHubConfigService.create(newConfig);
    }

    // do we want route guards or can this be publicly visible?
    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get(`:id`)
    async fetch(@Param('id') id: string) {
        return this.languageHubConfigService.fetchById(id);
    }

    // use admin route guard
    //   @Patch('')
    //   async update(@Body updateDto: SiteConfigUpdateDto){
    //     return this.configService.update(updateDto);
    //   }
}
