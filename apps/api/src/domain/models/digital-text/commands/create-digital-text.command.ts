import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateTypeProperty } from '../../shared/common-commands';
import { CREATE_DIGITAL_TEXT } from '../constants';

export class DigitalTextCompositeId {
    @AggregateTypeProperty([AggregateType.digitalText])
    type = AggregateType.digitalText;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    // TODO: use constants file
    type: CREATE_DIGITAL_TEXT,
    label: 'Create Digital Text',
    description: 'Creates a new digital text',
})
export class CreateDigitalText implements ICommandBase {
    @NestedDataType(DigitalTextCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.digitalText
    >;

    @NonEmptyString({
        isOptional: false,
        label: 'title',
        description: "digital text's title in the given language",
    })
    readonly title: string;

    @LanguageCodeEnum({
        label: 'language for title',
        description: 'the language in which you are titling the digital text',
    })
    readonly languageCodeForTitle: LanguageCode;
}
