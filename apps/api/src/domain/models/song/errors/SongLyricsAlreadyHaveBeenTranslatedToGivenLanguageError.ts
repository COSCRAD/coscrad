import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { Song } from '../song.entity';

export class SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError extends InternalError {
    constructor(song: Song, languageCode: LanguageCode) {
        super(
            `${formatAggregateCompositeIdentifier(
                song
            )} already has lyrics in the language: ${languageCode}`
        );
    }
}
