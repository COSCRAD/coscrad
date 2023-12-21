import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandBase,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { AggregateTypeProperty } from '../../../shared/common-commands';

export class PhotographCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.photograph])
    readonly type = AggregateType.photograph;

    @UUID({
        label: 'Photograph ID',
        description: 'system reference to this photograph',
    })
    readonly id: AggregateId;
}

@Command({
    type: `CREATE_PHOTOGRAPH`,
    label: `Create Photograph`,
    description: `create a digital photograph with metadata from a raw media item`,
})
export class CreatePhotograph implements ICommandBase {
    @NestedDataType(PhotographCompositeIdentifier, {
        label: 'composite identifier',
        description: 'a global system reference to the photograph',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @NonEmptyString({
        label: 'title',
        description: 'the title of the photograph',
    })
    readonly title: string;

    @LanguageCodeEnum({
        label: 'language for title',
        description: 'the language in which you are naming the photograph',
    })
    readonly languageCodeForTitle: LanguageCode;

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID',
        description: 'reference to the raw media item for this photograph',
    })
    readonly mediaItemId: AggregateId;

    @NonEmptyString({
        label: 'photographer',
        description: 'the name of the person who took this photograph',
    })
    readonly photographer: string;

    @NonNegativeFiniteNumber({
        label: `height (px)`,
        description: `the height of the digital photograph in pixels`,
    })
    heightPx: number;

    @NonNegativeFiniteNumber({
        label: `width (px)`,
        description: `the width of the digital photograph in pixels`,
    })
    widthPx: number;
}
