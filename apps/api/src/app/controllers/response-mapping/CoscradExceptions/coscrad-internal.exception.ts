import { HttpException } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import httpStatusCodes from '../../../constants/httpStatusCodes';

export class CoscradInternalException extends HttpException {
    constructor(internalError: InternalError) {
        const msg = internalError.toString();

        super(msg, httpStatusCodes.internalError);
    }
}
