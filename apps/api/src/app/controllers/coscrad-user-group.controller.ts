import { isStringWithNonzeroLength } from '@coscrad/validation';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoscradUserGroupQueryService } from '../../domain/services/query-services/coscrad-user-group-query.service';
import { InternalError } from '../../lib/errors/InternalError';
import sendInternalResultAsHttpResponse from './resources/common/sendInternalResultAsHttpResponse';

@ApiTags('user management')
@Controller('userGroups')
export class CoscradUserGroupController {
    constructor(private readonly userGroupQueryService: CoscradUserGroupQueryService) {}

    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: string) {
        if (!isStringWithNonzeroLength(id))
            return sendInternalResultAsHttpResponse(
                res,
                new InternalError(`Invalid group ID: ${id}`)
            );

        const result = await this.userGroupQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, result);
    }

    @Get('')
    async fetchMany(@Res() res) {
        const result = await this.userGroupQueryService.fetchMany();

        return sendInternalResultAsHttpResponse(res, result);
    }
}
