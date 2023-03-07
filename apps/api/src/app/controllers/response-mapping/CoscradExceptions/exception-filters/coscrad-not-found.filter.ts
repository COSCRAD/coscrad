import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import httpStatusCodes from '../../../../constants/httpStatusCodes';
import { CoscradNotFoundException } from '../coscrad-not-found.exception';

@Catch(CoscradNotFoundException)
export class CoscradNotFoundFilter implements ExceptionFilter {
    catch(exception: CoscradNotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse();

        const request = ctx.getRequest();

        const statusCode = httpStatusCodes.notFound;

        response.status(statusCode).json({
            statusCode,
            timestamp: new Date().toISOString(),
            path: `${request.url}`,
            message: exception.toString(),
        });
    }
}
