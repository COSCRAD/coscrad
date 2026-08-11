import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoscradContributorQueryService } from '../../domain/services/query-services/coscrad-contributor-query.service';
import { AdminJwtGuard } from './command/command.controller';

export const CONTRIBUTOR_INDEX_ROUTE = 'contributors';

@ApiTags('contributors')
@Controller(CONTRIBUTOR_INDEX_ROUTE)
export class CoscradContributorController {
    constructor(private readonly coscradContributorService: CoscradContributorQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('')
    async fetchMany() {
        return this.coscradContributorService.fetchMany();
    }
}
