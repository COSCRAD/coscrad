import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateTypeProperty } from '../../shared/common-commands';

export class GeospatialMapCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.map])
    type = AggregateType.map;

    @UUID({
        label: 'id',
        description: 'unique ID for this geospatial map',
    })
    id: AggregateId;
}

@Command({
    type: 'CREATE_MAP',
    label: 'Create Map',
    description: 'Create a custom curated map',
})
export class CreateMap implements ICommandBase {
    readonly aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    name: MultilingualText;

    languageCodeForName: LanguageCode;

    description: MultilingualText;

    languageCodeForDescription: LanguageCode;

    points: AggregateId[];
}
