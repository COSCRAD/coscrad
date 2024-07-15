import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    BooleanDataType,
    NestedDataType,
    NonEmptyString,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { PageIdentifier } from '../../entities';
import { DigitalTextCompositeId } from '../create-digital-text.command';

export class AudioAndTextContentForPage {
    @NonEmptyString({
        label: 'text',
        description: 'text content for the page',
    })
    readonly text: string;

    @LanguageCodeEnum({
        label: 'language for the page you are importing',
        description: 'language for the page you are importing',
    })
    readonly languageCode: LanguageCode;

    @ReferenceTo(AggregateType.audioItem)
    @UUID({
        label: 'audio item for page',
        description: 'a reference to the audio for this page',
        isOptional: true,
    })
    readonly audioItemId?: AggregateId;

    @BooleanDataType({
        label: 'is original language',
        description: 'is this text item in the original language (not a translation)',
    })
    readonly isOriginalLanguage: boolean;
}

export class DigitalTextPageImportRecord {
    @NonEmptyString({
        label: 'page identifier',
        description: 'identifier for the page being imported',
    })
    readonly pageIdentifier: PageIdentifier;

    @NestedDataType(AudioAndTextContentForPage, {
        label: 'audio and text content for all pages',
        description: 'list of audio (optional) and multilingual text for every page',
        isArray: true,
    })
    readonly content: AudioAndTextContentForPage[];

    @ReferenceTo(AggregateType.photograph)
    @UUID({
        label: 'photograph for page',
        description: 'a reference to the photograph for this page',
        // TODO can't we get this from the TypeScript type?
        isOptional: true,
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

    @NestedDataType(DigitalTextPageImportRecord, {
        label: 'pages to import',
        description: 'list of all pages to import',
        isArray: true,
        // the array cannot be empty
        isOptional: false,
    })
    readonly pages: DigitalTextPageImportRecord[];
}
