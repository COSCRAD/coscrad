import { Controller, Get, Param, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryResponseTransformInterceptor } from '../../../../app/controllers/response-mapping';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../../../../app/controllers/response-mapping/CoscradExceptions/exception-filters';
import { MemoryMatchService } from '../services/memory-match.service';

@ApiTags('games')
@Controller('games/memory-match')
@UseFilters(
    new CoscradNotFoundFilter(),
    new CoscradInvalidUserInputFilter(),
    new CoscradInternalErrorFilter()
)
@UseInterceptors(QueryResponseTransformInterceptor)
export class MemoryMatchController {
    constructor(private readonly memoryMatchService: MemoryMatchService) {}

    @Get(`/:id`)
    async fetchById(@Param('id') id: string) {
        return this.memoryMatchService.fetchById(id);
    }

    @Get('')
    async fetchMany() {
        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-305] send back unpublished rounds to admin users in the future
        return this.memoryMatchService.fetchMany();
    }
}
