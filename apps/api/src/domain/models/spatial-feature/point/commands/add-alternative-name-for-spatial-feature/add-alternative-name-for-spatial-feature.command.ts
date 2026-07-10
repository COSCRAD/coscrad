import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { SpatialFeatureCompositeIdentifier } from '../create-point/create-point.command';

@CoscradDataExample<AddAlternativeNameForSpatialFeature>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.spatialFeature,
            id: buildDummyUuid(1),
        },
        label: 'historical',
        text: 'Big Rock',
        languageCode: LanguageCode.English,
    },
})
@Command({
    type: 'ADD_ALTERNATIVE_NAME_FOR_SPATIAL_FEATURE',
    label: 'add alternative name',
    description: 'add a alternative name for this spatial feature',
})
export class AddAlternativeNameForSpatialFeature implements ICommandBase {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @NonEmptyString({
        label: 'label',
        description: 'a label that uniquely identifies this alternative name from others',
    })
    label: string;

    @NonEmptyString({
        label: 'text',
        description: 'the text for this alternative name',
    })
    text: string;

    @LanguageCodeEnum({
        label: 'language code',
        description: 'the language in which you are providing an alternative name',
    })
    languageCode: LanguageCode;
}
