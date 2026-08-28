import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { GeospatialMapCompositeIdentifier } from '../create-map.command';

@Command({
    type: 'TRANSLATE_MAP_NAME',
    label: 'Translates a Map Name',
    description: 'translates a map name',
})
export class TranslateMapName implements ICommandBase {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @NonEmptyString({
        label: 'translation',
        description: 'translation for the map name',
    })
    translationOfName: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which you are translating the map name',
    })
    languageCode: LanguageCode;
}
