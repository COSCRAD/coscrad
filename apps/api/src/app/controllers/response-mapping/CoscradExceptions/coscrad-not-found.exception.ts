import { HttpException } from '@nestjs/common';
import httpStatusCodes from '../../../constants/httpStatusCodes';

export class CoscradNotFoundException extends HttpException {
    constructor() {
        super(`The requested resource was not found.`, httpStatusCodes.notFound);
    }
}
