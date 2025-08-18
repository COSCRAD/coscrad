import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';

export class CannotOverwriteTextForMemoryMatchCardError extends InternalError {
    constructor(
        roundId: AggregateId,
        cardSequenceNumber: number,
        existingText: MultilingualText,
        newText: string,
        newLanguageCode: LanguageCode
    ) {
        const msg = [
            `You cannot add the text:`,
            `${newText} {${newLanguageCode}}`,
            `to card ${cardSequenceNumber}`,
            `in memory match round ${roundId}`,
            `as it already has the text`,
            existingText.toString(),
        ].join(' ');

        super(msg);
    }
}
