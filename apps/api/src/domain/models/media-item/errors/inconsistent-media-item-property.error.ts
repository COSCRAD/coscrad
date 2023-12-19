import { MIMEType } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';

export class InconsistentMediaItemPropertyError extends InternalError {
    constructor(propertyName: string, mimeType: MIMEType) {
        super(`A media item with MIME Type: ${mimeType} cannot have the property: ${propertyName}`);
    }
}
