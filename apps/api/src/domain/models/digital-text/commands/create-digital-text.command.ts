import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
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

@CoscradDataExample<CreateDigitalText>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.digitalText,
            id: buildDummyUuid(1),
        },
        title: 'Three Big Pigs',
        languageCodeForTitle: LanguageCode.English,
    },
})
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

    public static fromDto(dto: DTO<CreateDigitalText>) {
        const instance = new CreateDigitalText();

        Object.assign(instance, dto);

        return instance;
    }
}
