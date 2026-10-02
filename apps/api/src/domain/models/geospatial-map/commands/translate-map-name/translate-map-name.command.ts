import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { GeospatialMapCompositeIdentifier } from '../create-map.command';

@CoscradDataExample<TranslateMapName>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.map,
            id: buildDummyUuid(2),
        },
        translationOfName: 'Translation of the geospatial map name',
        languageCode: LanguageCode.Chilcotin,
    },
})
@Command({
    type: 'TRANSLATE_MAP_NAME',
    label: 'Translate Name',
    description: "translate a map's name into an additional language",
})
export class TranslateMapName implements ICommandBase {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @NonEmptyString({
        label: 'translation',
        description: "translation of the map's name",
    })
    translationOfName: string;

    @LanguageCodeEnum({
        label: 'language',
        description: "language in which you are translating the map's name",
    })
    languageCode: LanguageCode;
}
