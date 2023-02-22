import { AggregateCompositeIdentifier, MIMEType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';

export class InvalidMIMETypeForAudiovisualResourceError extends InternalError {
    constructor(compositeId: AggregateCompositeIdentifier, invalidMimeType: MIMEType) {
        super(
            `You cannot add a media item with the disallowed MIME type: ${invalidMimeType} to ${formatAggregateCompositeIdentifier(
                compositeId
            )}`
        );
    }
}
