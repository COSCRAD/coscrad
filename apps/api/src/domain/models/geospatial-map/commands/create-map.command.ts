import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { LanguageCodeEnum } from '../../../common/entities/multilingual-text';
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
        name: 'Placenames',
        languageCodeForName: LanguageCode.English,
        description: 'A map of important traditional placenames',
        languageCodeForDescription: LanguageCode.Chilcotin,
    },
})
@Command({
    type: 'CREATE_MAP',
    label: 'Create Map',
    description: 'Create a custom curated map',
})
export class CreateMap implements ICommandBase {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    // TODO should this be just a neme: string, languageCodeForName: LanguageCode
    @NonEmptyString({
        label: 'name',
        description: 'name for the map',
    })
    name: string;

    @LanguageCodeEnum({
        label: 'language code for name',
        description: 'language code for the name',
    })
    languageCodeForName: LanguageCode;

    @NonEmptyString({
        label: 'description',
        description: 'description of map',
    })
    description: string;

    @LanguageCodeEnum({
        label: 'language code for discription',
        description: 'language code for the discription',
    })
    languageCodeForDescription: LanguageCode;
}
