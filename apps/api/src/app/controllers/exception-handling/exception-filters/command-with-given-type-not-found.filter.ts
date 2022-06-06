import { CommandWithGivenTypeNotFoundException } from '@coscrad/commands';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import httpStatusCodes from '../../../constants/httpStatusCodes';

@Catch(CommandWithGivenTypeNotFoundException)
export class CommandWithGivenTypeNotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: CommandWithGivenTypeNotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse();

        const request = ctx.getRequest();

        const status = httpStatusCodes.badRequest;

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: `Invalid command type. ${exception.toString()}`,
        });
    }
}
