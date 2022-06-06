import { NoCommandHandlerRegisteredForCommandException } from '@coscrad/commands';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import httpStatusCodes from '../../../constants/httpStatusCodes';

@Catch(NoCommandHandlerRegisteredForCommandException)
export class NoCommandHandlerForCommandTypeFilter implements ExceptionFilter {
    catch(exception: NoCommandHandlerRegisteredForCommandException, host: ArgumentsHost) {
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
