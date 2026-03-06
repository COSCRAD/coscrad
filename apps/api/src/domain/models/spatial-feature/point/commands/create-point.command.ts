import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    FiniteNumber,
    FromDomainModel,
    NestedDataType,
    NonEmptyString,
    UUID,
} from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { AggregateId } from '../../../../types/AggregateId';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AggregateTypeProperty } from '../../../shared/common-commands';
import { SpatialFeatureProperties } from '../entities/spatial-feature-properties.entity';
import { CREATE_POINT } from './constants';

@CoscradDataExample<MultilingualTextItemForCommand>({
    example: {
        text: 'windy valley',
        languageCode: LanguageCode.Chilcotin,
    },
})
class MultilingualTextItemForCommand {
    @NonEmptyString({
        label: 'text',
        description: 'text for the given langauge',
    })
    text: string;

    @LanguageCodeEnum({
        label: 'language code',
        description: 'the language of the provided text',
    })
    languageCode: LanguageCode;
}

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
            id: buildDummyUuid(123),
            type: AggregateType.spatialFeature,
        },
        lattitude: 51.9,
        longitude: 123,
        description: 'a traditional village',
        // note that one of these must be explicitly specified when calling `buildTestInstance`
        // traditionalName
        // contemporaryName
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

    /**
     * TODO Restrict the range of this. We need to be careful when doing so.
     * References:
     * - [GEO JSON Pole definitions](https://datatracker.ietf.org/doc/html/rfc7946#section-5.3)
     * - [Lattitude (Wikipedia)](https://en.wikipedia.org/wiki/Latitude)
     *
     */
    @FiniteNumber({
        label: `lattitude`,
        description: 'lattitude',
    })
    readonly lattitude: number;

    /**
     * TODO Restrict the range of this
     * - [Longitude (Wikipedia)](https://en.wikipedia.org/wiki/Longitude)
     */
    @FiniteNumber({
        label: `longitude`,
        description: `longitude`,
    })
    readonly longitude: number;

    // TODO support elevation

    /**
     * Note that one of `traditionalName` and `contemporaryName` must be specified.
     */
    @NestedDataType(MultilingualTextItemForCommand, {
        label: 'traditional name',
        description: 'What was this place traditionally called by locals?',
        isOptional: true,
    })
    readonly traditionalName?: MultilingualTextItemForCommand;

    @NestedDataType(MultilingualTextItemForCommand, {
        label: 'contemporary-name',
        description: 'What is the contemporary name for this place?',
        isOptional: true,
    })
    readonly contemporaryName?: MultilingualTextItemForCommand;

    @FromDomainModel(SpatialFeatureProperties)
    readonly description: string;

    @FromDomainModel(SpatialFeatureProperties)
    readonly imageUrl?: string;
}
