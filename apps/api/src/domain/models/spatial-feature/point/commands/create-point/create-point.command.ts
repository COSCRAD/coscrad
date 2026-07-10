import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { FiniteNumber, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import { LanguageCodeEnum } from '../../../../../common/entities/multilingual-text';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateTypeProperty } from '../../../../shared/common-commands';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { CREATE_POINT } from './constants';

export class SpatialFeatureCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.spatialFeature])
    type = AggregateType.spatialFeature;

    @UUID({
        label: 'id',
        description: 'unique ID for this spatial feature',
    })
    id: AggregateId;
}

@CoscradDataExample<CreatePoint>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.spatialFeature,
            id: buildDummyUuid(123),
        },
        lattitude: 49.0,
        longitude: -123.3,
        name: 'Big Rock',
        languageCodeForName: LanguageCode.English,
        description: 'There is a big rock here.',
    },
})
@Command({
    type: CREATE_POINT,
    label: 'Create Point',
    description: `Create a spatial feature with 2D Point geometry`,
})
export class CreatePoint implements ICommandBase {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier for this spatial feature',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @FiniteNumber({
        label: 'lattitude',
        description: 'lattitude',
    })
    lattitude: number;

    @FiniteNumber({
        label: 'longitude',
        description: 'longitude',
    })
    longitude: number;

    // TODO support elevation

    @NonEmptyString({
        label: 'name',
        description: 'name for this place',
    })
    readonly name: string;

    @LanguageCodeEnum({
        label: 'language code for name',
        description: 'the language in which you are naming this point on the map',
    })
    languageCodeForName: LanguageCode;

    @NonEmptyString({
        label: 'description',
        description: 'short descripton of this place',
    })
    readonly description: string;
}
