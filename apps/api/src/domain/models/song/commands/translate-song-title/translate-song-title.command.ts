import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { SongCompositeId } from '../create-song.command';
import { TRANSLATE_SONG_TITLE } from './consants';

@Command({
    type: TRANSLATE_SONG_TITLE,
    label: 'Translate Title',
    description: 'Translate existing song title to a different language',
})
export class TranslateSongTitle implements ICommandBase {
    @NestedDataType(SongCompositeId, {
        label: 'composite identifier',
        description: 'system-wide unique ID for this song',
    })
    readonly aggregateCompositeIdentifier: SongCompositeId;

    @NonEmptyString({
        label: 'translation',
        description: 'translation for the title',
    })
    translation: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which the title is being translated',
    })
    languageCode: LanguageCode;
}
