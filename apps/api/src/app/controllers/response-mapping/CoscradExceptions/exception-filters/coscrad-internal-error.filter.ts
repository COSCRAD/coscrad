import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import httpStatusCodes from '../../../../constants/httpStatusCodes';
import { CoscradInternalException } from '../coscrad-internal.exception';

@Catch(CoscradInternalException)
export class CoscradInternalErrorFilter implements ExceptionFilter {
    catch(exception: CoscradInternalException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse();

        const request = ctx.getRequest();

        const statusCode = httpStatusCodes.internalError;

        response.status(statusCode).json({
            statusCode,
            timestamp: '1', //new Date().toISOString(),
            path: request.url,
            message: exception.toString(),
        });
    }
}
