import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError extends InternalError {
    constructor(songId: AggregateId, languageCode: LanguageCode) {
        super(
            `${formatAggregateCompositeIdentifier({
                type: AggregateType.song,
                id: songId,
            })} already has lyrics in the language: ${languageCode}`
        );
    }
}
