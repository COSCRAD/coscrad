import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { VocabularyListCompositeId } from '../commands/create-vocabulary-list';

export class DuplicateVocabularyListNameError extends InternalError {
    constructor(
        newVocabularyListCompositeIdentifier: VocabularyListCompositeId,
        existingVocabularyListCompositeIdentifier: VocabularyListCompositeId,
        duplicateName: MultilingualTextItem
    ) {
        const msg = [
            `You cannot create ${formatAggregateCompositeIdentifier(
                newVocabularyListCompositeIdentifier
            )}`,
            `as ${formatAggregateCompositeIdentifier(existingVocabularyListCompositeIdentifier)}`,
            `already has the same name: `,
            duplicateName.toString(),
        ].join(' ');

        super(msg);
    }
}
