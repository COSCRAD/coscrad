import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { CategorizableCompositeIdentifier } from '../../../categories/types/ResourceOrNoteCompositeIdentifier';

export class DuplicateTagError extends InternalError {
    constructor(
        tagLabel: string,
        taggedMemberCompositeIdentifier: CategorizableCompositeIdentifier
    ) {
        const msg = `You cannot tag ${formatAggregateCompositeIdentifier(
            taggedMemberCompositeIdentifier
        )} with the tag: ${tagLabel}, as it has already been tagged with this label.`;

        super(msg);
    }
}
