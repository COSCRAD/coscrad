import { AggregateType, MIMEType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';

export class InvalidMIMETypeForTranscriptMediaError extends InternalError {
    constructor(transcriptId: AggregateId, invalidMimeType: MIMEType) {
        super(
            `You cannot add a media item with the disallowed MIME type: ${invalidMimeType} to ${formatAggregateCompositeIdentifier(
                {
                    type: AggregateType.audioItem,
                    id: transcriptId,
                }
            )}`
        );
    }
}
