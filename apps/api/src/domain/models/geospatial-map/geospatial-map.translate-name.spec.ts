import { LanguageCode } from '@coscrad/api-interfaces';
import { buildTestInstance } from '../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { GeospatialMap } from './geospatial-map.entity';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.French;

const existingGeospatialMapWithTextInOneLanguage = buildTestInstance(GeospatialMap, {
    name: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
});

const translationText = 'translation for the geospatial map name text';

describe(`GeospatialMap.translateName`, () => {
    describe(`when the translation is valid`, () => {
        it(`should translate the name`, () => {
            const result = existingGeospatialMapWithTextInOneLanguage.translateName(
                translationText,
                translationLanguageCode
            );

            expect(result).toBeInstanceOf(GeospatialMap);
        });
    });
});
