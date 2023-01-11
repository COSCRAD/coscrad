import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoscradUserQueryService } from '../../domain/services/query-services/coscrad-user-query.service';
import { InternalError } from '../../lib/errors/InternalError';
import { AdminJwtGuard } from './command/command.controller';
import { SWAGGER_TAG_ADMIN, USER_INDEX_ROUTE } from './constants';
import sendInternalResultAsHttpResponse from './resources/common/sendInternalResultAsHttpResponse';

@ApiTags(SWAGGER_TAG_ADMIN)
@Controller(USER_INDEX_ROUTE)
export class CoscradUserController {
    constructor(private readonly userQueryService: CoscradUserQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: string) {
        if (!isNonEmptyString(id))
            return sendInternalResultAsHttpResponse(
                res,
                new InternalError(`Invalid user ID: ${id}`)
            );

        const result = await this.userQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, result);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('')
    async fetchMany(@Res() res) {
        const result = await this.userQueryService.fetchMany();

        return sendInternalResultAsHttpResponse(res, result);
    }
}
