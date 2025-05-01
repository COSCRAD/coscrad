import {
    ICommandBase,
    LanguageCode,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../../../test-data/utilities';
import { DTO } from '../../../../../../../types/DTO';
import { LanguageCodeEnum } from '../../../../../../common/entities/multilingual-text';
import { AudioVisualCompositeIdentifier } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { IMPORT_LINE_ITEMS_TO_TRANSCRIPT } from '../constants';

@CoscradDataExample<TranscriptLineItemDto>({
    example: {
        inPointMilliseconds: 100,
        outPointMilliseconds: 200,
        text: 'hello',
        languageCode: LanguageCode.English,
        speakerInitials: 'JD',
    },
})
export class TranscriptLineItemDto {
    @NonNegativeFiniteNumber({
        label: 'in point (ms)',
        description: 'the opening timestamp in milliseconds',
    })
    readonly inPointMilliseconds: number;

    @NonNegativeFiniteNumber({
        label: 'out point (ms)',
        description: 'the closing timestamp in milliseconds',
    })
    readonly outPointMilliseconds: number;

    @NonEmptyString({
        label: 'text',
        description: 'multi-lingual text transcription translation',
    })
    readonly text: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language for this text item',
    })
    readonly languageCode: LanguageCode;

    @NonEmptyString({
        label: 'speaker initials',
        description: 'the initials of the speaker whose words you are transribing \\ translating',
    })
    readonly speakerInitials: string;

    constructor(dto: DTO<TranscriptLineItemDto>) {
        if (!dto) return;

        const { inPointMilliseconds, outPointMilliseconds, text, languageCode, speakerInitials } =
            dto;

        this.inPointMilliseconds = inPointMilliseconds;

        this.outPointMilliseconds = outPointMilliseconds;

        this.speakerInitials = speakerInitials;

        this.text = text;

        this.languageCode = languageCode;
    }

    public static fromDto(dto: DTO<TranscriptLineItemDto>) {
        return new TranscriptLineItemDto(dto);
    }
}

@Command({
    type: IMPORT_LINE_ITEMS_TO_TRANSCRIPT,
    description: `import line items (in orignal language) to an existing transcript`,
    label: `Import Line Items to Trancript`,
})
export class ImportLineItemsToTranscript implements ICommandBase {
    @NestedDataType(AudioVisualCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier<
        typeof ResourceType.video | typeof ResourceType.audioItem
    >;

    @NestedDataType(TranscriptLineItemDto, {
        label: 'line items',
        description: 'line items (orignal language) from an existing transcript',
        isArray: true,
        isOptional: false,
    })
    readonly lineItems: TranscriptLineItemDto[];
}
