import { isNonEmptyObject } from '@coscrad/validation-constraints';
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseFilters,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import buildByIdApiParamMetadata from '../../../../app/controllers/resources/common/buildByIdApiParamMetadata';
import { QueryResponseTransformInterceptor } from '../../../../app/controllers/response-mapping';
import { CoscradInvalidUserInputException } from '../../../../app/controllers/response-mapping/CoscradExceptions';
import {
    CoscradInternalErrorFilter,
    CoscradInvalidUserInputFilter,
    CoscradNotFoundFilter,
} from '../../../../app/controllers/response-mapping/CoscradExceptions/exception-filters';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { MemoryMatchRoundCreationDto } from '../models/dtos/memory-match-round-creation.dto';
import { MemoryMatchRoundImportDto } from '../models/dtos/memory-match-round-import.dto';
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

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get(`/:id`)
    async fetchById(@Param('id') id: string, @Request() req) {
        return this.memoryMatchService.fetchById(id, req.user || undefined);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiParam(buildByIdApiParamMetadata())
    @Get('')
    async fetchMany(@Request() req) {
        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-305] send back unpublished rounds to admin users in the future
        const result = await this.memoryMatchService.fetchMany(req?.user || undefined);

        return result;
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('')
    async create(@Body() dto: MemoryMatchRoundCreationDto) {
        const result = await this.memoryMatchService.create(dto);

        if (result instanceof Error) {
            return result;
        }

        return {
            id: result,
        };
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Patch(':id/publish')
    async publish(@Param('id') id: string) {
        const result = await this.memoryMatchService.publish(id);

        return result;
    }

    @ApiBearerAuth(`JWT`)
    @UseGuards(AdminJwtGuard)
    @Patch(`:id/unpublish`)
    async unpublish(@Param('id') id: string) {
        const result = await this.memoryMatchService.unpublish(id);

        return result;
    }

    @ApiBearerAuth(`JWT`)
    @UseGuards(AdminJwtGuard)
    @Post('import')
    async import(@Body() dto: MemoryMatchRoundImportDto) {
        if (!isNonEmptyObject(dto)) {
            return new CoscradInvalidUserInputException(
                new InternalError(
                    `You must provide a round import record on the body of the request`
                )
            );
        }

        const result = await this.memoryMatchService.import(dto);

        if (isInternalError(result)) {
            return new CoscradInvalidUserInputException(result);
        }

        return {
            id: result,
        };
    }
}
