import { isStringWithNonzeroLength } from '@coscrad/validation';
import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoscradUserQueryService } from '../../domain/services/query-services/user-query.service';
import { InternalError } from '../../lib/errors/InternalError';
import sendInternalResultAsHttpResponse from './resources/common/sendInternalResultAsHttpResponse';

@ApiTags('user management')
@Controller('users')
export class CoscradUserController {
    constructor(private readonly userQueryService: CoscradUserQueryService) {}

    @Get('/:id')
    async fetchById(@Res() res, @Param('id') id: string) {
        if (!isStringWithNonzeroLength(id))
            return sendInternalResultAsHttpResponse(
                res,
                new InternalError(`Invalid user ID: ${id}`)
            );

        const result = await this.userQueryService.fetchById(id);

        return sendInternalResultAsHttpResponse(res, result);
    }

    @Get('')
    async fetchMany(@Res() res) {
        const result = await this.userQueryService.fetchMany();

        return sendInternalResultAsHttpResponse(res, result);
    }
}
