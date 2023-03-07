import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import httpStatusCodes from '../../../../constants/httpStatusCodes';
import { CoscradInvalidUserInputException } from '../coscrad-invalid-user-input.exception';

@Catch(CoscradInvalidUserInputException)
export class CoscradInvalidUserInputFilter implements ExceptionFilter {
    catch(exception: CoscradInvalidUserInputException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse();

        const request = ctx.getRequest();

        const statusCode = httpStatusCodes.badRequest;

        response.status(statusCode).json({
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.toString(),
        });
    }
}
