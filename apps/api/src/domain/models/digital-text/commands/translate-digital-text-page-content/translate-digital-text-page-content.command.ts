import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, PageNumber } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { PageIdentifier } from '../../entities';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@Command({
    type: `TRANSLATE_DIGITAL_TEXT_PAGE_CONTENT`,
    label: `Translate Digital Text Page Content`,
    description: `Tranlate the digital text page content to another language`,
})
export class TranslateDigitalTextPageContent implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: `Composite Identifier`,
        description: `system-wide unique identifier`,
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @PageNumber({
        label: `identifier`,
        description: `text identifier for the page`,
    })
    readonly pageIdentifier: PageIdentifier;

    @NonEmptyString({
        label: `translation`,
        description: `translation for the page content`,
    })
    readonly translation: string;

    @LanguageCodeEnum({
        label: `language code`,
        description: `the language in which you are naming the new digital text page content`,
    })
    readonly languageCode: LanguageCode;
}
