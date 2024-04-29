import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

@Command({
    type: 'TRANSLATE_NOTE_ABOUT_RESOURCE',
    label: 'Translates a Note About Resource',
    description: 'translate a note about resource',
})
export class TranslateNoteAboutResource implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    @NonEmptyString({
        label: 'text',
        description: 'text for the note',
    })
    text: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which you are translating the note',
    })
    languageCode: LanguageCode;
}
