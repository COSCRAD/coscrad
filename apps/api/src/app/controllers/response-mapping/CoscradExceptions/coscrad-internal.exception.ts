import { HttpException } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import httpStatusCodes from '../../../constants/httpStatusCodes';

export class CoscradInternalException extends HttpException {
    constructor(internalError: InternalError) {
        super(internalError.toString(), httpStatusCodes.internalError);
    }
}
