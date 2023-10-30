import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import httpStatusCodes from '../../../../constants/httpStatusCodes';
import { CoscradInternalException } from '../coscrad-internal.exception';

@Catch(CoscradInternalException)
@Catch(InternalError)
export class CoscradInternalErrorFilter implements ExceptionFilter {
    catch(exception: CoscradInternalException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse();

        const request = ctx.getRequest();

        const statusCode = httpStatusCodes.internalError;

        response.status(statusCode).json({
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.toString(),
        });
    }
}
