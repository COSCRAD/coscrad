import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { SpatialFeatureCompositeIdentifier } from '../create-point.command';

@CoscradDataExample<TranslateSpatialFeatureName>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.spatialFeature,
            id: buildDummyUuid(1),
        },
        translation: 'Translation of the spatial feature name',
        languageCode: LanguageCode.Chinook,
    },
})
@Command({
    type: 'TRANSLATE_SPATIAL_FEATURE_NAME',
    label: 'Translate Spatial Feature Name',
    description: 'Translates the name of a place on the map',
})
export class TranslateSpatialFeatureName implements ICommandBase {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @NonEmptyString({
        label: 'translation',
        description: `translation for the spatial feature's name`,
    })
    translation: string;

    @LanguageCodeEnum({
        label: 'language',
        description: `the language in which you are translating the spatial feature's name`,
    })
    languageCode: LanguageCode;
}
