import buildAudioItemResourceModelContextStateValidatorTestCase from './buildAudioItemResourceModelContextStateValidatorTestCase';
import buildBibliographicReferenceResourceModelContextStateValidatorTestCase from './buildBibliographicReferenceResourceModelContextStateValidatorTestCase';
import buildBookResourceModelContextStateValidatorTestCase from './buildBookResourceModelContextStateValidatorTestCase';
import buildMediaItemResourceModelContextStateValidatorTestCase from './buildMediaItemResourceModelContextStateValidatorTestCase';
import buildPhotographResourceModelContextStateValidatorTestCase from './buildPhotographResourceModelContextStateValidatorTestCase';
import buildSongResourceModelContextStateValidatorTestCase from './buildSongResourceModelContextStateValidatorTestCase';
import buildSpatialFeatureResourceModelContextStateValidatorTestCase from './buildSpatialFeatureResourceModelContextStateValidatorTestCase';
import buildTermResourceModelContextStateValidatorTestCase from './buildTermResourceModelContextStateValidatorTestCase';
import buildVideoResourceModelContextStateValidatorTestCase from './buildVideoResourceModelContextStateValidatorTestCase';
import buildVocabularyListResourceModelContextStateValidatorTestCase from './buildVocabularyListResourceModelContextStateValidatorTestCase';

export default () => {
    const testCases = [
        buildBibliographicReferenceResourceModelContextStateValidatorTestCase(),
        buildBookResourceModelContextStateValidatorTestCase(),
        buildPhotographResourceModelContextStateValidatorTestCase(),
        buildSpatialFeatureResourceModelContextStateValidatorTestCase(),
        buildTermResourceModelContextStateValidatorTestCase(),
        buildAudioItemResourceModelContextStateValidatorTestCase(),
        buildVideoResourceModelContextStateValidatorTestCase(),
        buildVocabularyListResourceModelContextStateValidatorTestCase(),
        buildSongResourceModelContextStateValidatorTestCase(),
        buildMediaItemResourceModelContextStateValidatorTestCase(),
    ];

    return testCases;
};
