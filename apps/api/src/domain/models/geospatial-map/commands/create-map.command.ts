import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateTypeProperty } from '../../shared/common-commands';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';

export class GeospatialMapCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.map])
    type = AggregateType.map;

    @UUID({
        label: 'id',
        description: 'unique ID for this geospatial map',
    })
    id: AggregateId;
}

@CoscradDataExample<CreateMap>({
    example: {
        aggregateCompositeIdentifier: {
            id: buildDummyUuid(8),
            type: AggregateType.map,
        },
        name: { items: [] },
        languageCodeForName: LanguageCode.English,
        description: { items: [] },
        languageCodeForDescription: LanguageCode.Chilcotin,
        spatialFeatures: [],
    },
})
@Command({
    type: 'CREATE_MAP',
    label: 'Create Map',
    description: 'Create a custom curated map',
})
export class CreateMap implements ICommandBase {
    readonly aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'name',
        description: 'name for the map',
    })
    name: MultilingualText;

    languageCodeForName: LanguageCode;

    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'description',
        description: 'description of map',
    })
    description: MultilingualText;

    languageCodeForDescription: LanguageCode;

    spatialFeatures: AggregateId[];
}
