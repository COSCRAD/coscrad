import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../common/entities/multilingual-text';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

@Command({
    type: 'TRANSLATE_NOTE',
    label: 'Translates a Note',
    description: 'translate a note',
})
export class TranslateNote implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    @NonEmptyString({
        label: 'translation',
        description: 'translation for the note',
    })
    text: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which you are translating the note',
    })
    languageCode: LanguageCode;
}
