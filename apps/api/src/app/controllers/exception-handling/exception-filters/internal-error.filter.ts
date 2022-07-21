import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import httpStatusCodes from '../../../constants/httpStatusCodes';

@Catch(InternalError)
export class InternalErrorFilter implements ExceptionFilter {
    catch(exception: InternalError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse();

        const request = ctx.getRequest();

        const status = httpStatusCodes.internalError;

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.toString(),
        });
    }
}
