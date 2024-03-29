import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { SongCompositeId } from '../create-song.command';
import { ADD_LYRICS_FOR_SONG } from '../translate-song-lyrics/constants';

@Command({
    type: ADD_LYRICS_FOR_SONG,
    label: 'Add Lyrics for existing Song',
    description: 'add lyrics for an existing song',
})
export class AddLyricsForSong implements ICommandBase {
    @NestedDataType(SongCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique idenifier',
    })
    readonly aggregateCompositeIdentifier: SongCompositeId;

    @NonEmptyString({
        label: 'song lyrics',
        description: 'lyrics for song',
    })
    readonly lyrics: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language of the lyrics',
    })
    readonly languageCode: LanguageCode;
}
