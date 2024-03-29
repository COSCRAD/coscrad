import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CoscradUserGroupQueryService } from '../../domain/services/query-services/coscrad-user-group-query.service';
import { InternalError } from '../../lib/errors/InternalError';
import { AdminJwtGuard } from './command/command.controller';
import { SWAGGER_TAG_ADMIN, USER_GROUP_INDEX_ROUTE } from './constants';
import sendInternalResultAsHttpResponse from './resources/common/sendInternalResultAsHttpResponse';

@ApiTags(SWAGGER_TAG_ADMIN)
@Controller(USER_GROUP_INDEX_ROUTE)
export class CoscradUserGroupController {
    constructor(private readonly userGroupQueryService: CoscradUserGroupQueryService) {}

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: string) {
        if (!isNonEmptyString(id))
            return sendInternalResultAsHttpResponse(
                res,
                new InternalError(`Invalid group ID: ${id}`)
            );

        const result = await this.userGroupQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, result);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('')
    async fetchMany(@Res() res) {
        const result = await this.userGroupQueryService.fetchMany();

        return sendInternalResultAsHttpResponse(res, result);
    }
}
