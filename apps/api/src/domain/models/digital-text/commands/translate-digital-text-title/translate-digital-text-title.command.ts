import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: `TRANSLATE_DIGITAL_TEXT_TITLE`,
    label: `Translate Digital Text Title`,
    description: `Translate the digital text title to another language`,
})
export class TranslateDigitalTextTitle implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: `Composite Identifier`,
        description: `system-wide unique identifier`,
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @NonEmptyString({
        label: `translation`,
        description: `translation for the title`,
    })
    readonly translation: string;

    @LanguageCodeEnum({
        label: `language code`,
        description: `the language in which you are translating the digital text's title`,
    })
    readonly languageCode: LanguageCode;
}
