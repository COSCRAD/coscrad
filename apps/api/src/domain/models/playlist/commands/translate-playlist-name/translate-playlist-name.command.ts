import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum, PlayListCompositeId } from '../create-playlist.command';

@Command({
    type: 'TRANSLATE_PLAYLIST_NAME',
    label: 'translate playlist name',
    description: 'translating playlist names',
})
export class TranslatePlaylistName implements ICommandBase {
    @NestedDataType(PlayListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unqiue identifier',
    })
    readonly aggregateCompositeIdentifier: PlayListCompositeId;

    @LanguageCodeEnum
    readonly languageCode: LanguageCode;

    @NonEmptyString({
        description: 'text for the translated name',
        label: 'text',
    })
    readonly text: string;
}
