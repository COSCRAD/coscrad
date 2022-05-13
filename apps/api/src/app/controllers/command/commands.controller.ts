import { Controller, Post, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import isStringWithNonzeroLength from '../../../lib/utilities/isStringWithNonzeroLength';
import httpStatusCodes from '../../constants/httpStatusCodes';

@ApiTags('commands')
@Controller('commands')
export class CommandController {
    @ApiOkResponse()
    @Post('')
    issueCommand(
        @Res() res,
        @Query('type') type: string,
        @Query('payload') payload: Record<string, unknown>
    ) {
        if (!isStringWithNonzeroLength(type))
            return res
                .status(httpStatusCodes.badRequest)
                .send(`Invalid command type: ${JSON.stringify(type)}`);

        console.log(`You issued the command: ${type}`);

        return res.status(httpStatusCodes.ok).send({
            type,
            payload,
        });
    }
}
