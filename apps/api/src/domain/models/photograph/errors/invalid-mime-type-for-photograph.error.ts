import { MIMEType } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';

export class InvalidMimeTypeForPhotographError extends InternalError {
    constructor(invalidMimeType: MIMEType) {
        super(`MIME type: ${invalidMimeType} is not allowed for a photograph`);
    }
}
