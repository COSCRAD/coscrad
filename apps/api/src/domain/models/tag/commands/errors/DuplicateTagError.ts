import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { CategorizableCompositeIdentifier } from '../../../categories/types/ResourceOrNoteCompositeIdentifier';

export class DuplicateTagError extends InternalError {
    constructor(
        tagLabel: string,
        taggedMemberCompositeIdentifier: CategorizableCompositeIdentifier
    ) {
        const msg = `${formatAggregateCompositeIdentifier(
            taggedMemberCompositeIdentifier
        )} has already been tagged with: ${tagLabel}`;

        super(msg);
    }
}
