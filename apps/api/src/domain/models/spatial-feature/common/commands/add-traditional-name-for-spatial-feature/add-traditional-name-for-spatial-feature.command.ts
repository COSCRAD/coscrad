import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { SpatialFeatureCompositeIdentifier } from '../../../point/commands';

@CoscradDataExample<AddTraditionalNameForSpatialFeature>({
    example: {
        aggregateCompositeIdentifier: {
            id: buildDummyUuid(7),
            type: AggregateType.spatialFeature,
        },
        text: 'Text for the spatial feature',
        languageCode: LanguageCode.English,
    },
})
@Command({
    type: 'ADD_TRADITIONAL_NAME_FOR_SPATIAL_FEATURE',
    label: 'add traditional name for spatial feature',
    description: 'add traditional name for spatial feature',
})
export class AddTraditionalNameForSpatialFeature implements ICommandBase {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'spatial feature composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @NonEmptyString({
        label: 'traditional name',
        description: 'text for the traditional name of this spatial feature',
    })
    readonly text: string;

    @LanguageCodeEnum({
        label: 'language code for traditional name',
        description:
            'language in which you are providing a traditional name for this spatial feature',
    })
    readonly languageCode: LanguageCode;
}
