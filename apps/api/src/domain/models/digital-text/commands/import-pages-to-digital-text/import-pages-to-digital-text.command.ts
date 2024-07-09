import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { PageIdentifier } from '../../entities';
import { DigitalTextCompositeId } from '../create-digital-text.command';

class DigitalTextImportRecord {
    @NonEmptyString({
        label: 'page identifier',
        description: 'identifier for the page being imported',
    })
    readonly pageIdentifier: PageIdentifier;

    @NonEmptyString({
        label: 'text',
        description: 'text content for the page',
    })
    readonly text: string;

    @LanguageCodeEnum({
        label: 'language code for text',
        description: 'the language of the text content',
    })
    readonly languageCodeForText: LanguageCode;

    @NonEmptyString({
        label: 'translation',
        description: `translation of the page's content`,
        isOptional: true,
    })
    readonly translation?: string;

    @LanguageCodeEnum({
        label: 'translation language',
        description: 'the language in which the page content has been translated',
        isOptional: true,
    })
    readonly languageCodeForTranslation?: LanguageCode;

    // TODO support audio for multiple languages
    @UUID({
        label: 'audio item for page',
        description: 'a reference to the audio for this page',
    })
    readonly audioItemId?: AggregateId;

    @UUID({
        label: 'photograph for page',
        description: 'a reference to the photograph for this page',
    })
    readonly photographId?: AggregateId;
}

@Command({
    type: 'IMPORT_PAGES_TO_DIGITAL_TEXT',
    label: 'Import Pages to Digital Text',
    description: 'imports pages to a digital text',
})
export class ImportPagesToDigitalText implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: DigitalTextCompositeId;

    @NestedDataType(DigitalTextImportRecord, {
        label: 'pages to import',
        description: 'list of all pages to import',
        isArray: true,
        // the array cannot be empty
        isOptional: false,
    })
    readonly pages: DigitalTextImportRecord[];
}
