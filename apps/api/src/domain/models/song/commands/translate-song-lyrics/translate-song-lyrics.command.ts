import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../common/entities/multilingual-text';
import { SongCompositeId } from '../create-song.command';
import { TRANSLATE_SONG_LYRICS } from './constants';

@Command({
    type: TRANSLATE_SONG_LYRICS,
    label: 'Translate Lyrics',
    description: `Translate existing lyrics for a song into a different language`,
})
export class TranslateSongLyrics implements ICommandBase {
    @NestedDataType(SongCompositeId, {
        label: 'composite identifier',
        description: 'system-wide unique ID for this song',
    })
    readonly aggregateCompositeIdentifier: SongCompositeId;

    @NonEmptyString({
        label: 'translation',
        description: 'translation for the lyrics',
    })
    translation: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language to which the lyrics are being translated',
    })
    languageCode: LanguageCode;
}
