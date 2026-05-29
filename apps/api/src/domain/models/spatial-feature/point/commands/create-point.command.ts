import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { FiniteNumber, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateTypeProperty } from '../../../shared/common-commands';
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

    @NonEmptyString({
        label: 'image URL',
        description: 'descripton of this place',
    })
    readonly imageUrl?: string;
}
