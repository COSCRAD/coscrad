import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { DigitalTextCompositeId } from '../create-digital-text.command';

@CoscradDataExample<TranslateDigitalTextTitle>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.digitalText,
            id: buildDummyUuid(1),
        },
        translation: 'This is the test translation for the digital text title',
        languageCode: LanguageCode.Chilcotin,
    },
})
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

    public static fromDto(dto: DTO<TranslateDigitalTextTitle>) {
        const instance = new DigitalTextCompositeId();

        Object.assign(instance, dto);

        return instance;
    }
}
