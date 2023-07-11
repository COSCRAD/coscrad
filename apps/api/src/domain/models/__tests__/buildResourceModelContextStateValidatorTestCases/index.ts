import buildAudioItemResourceModelContextStateValidatorTestCase from './buildAudioItemResourceModelContextStateValidatorTestCase';
import buildBibliographicReferenceResourceModelContextStateValidatorTestCase from './buildBibliographicReferenceResourceModelContextStateValidatorTestCase';
import buildBookResourceModelContextStateValidatorTestCase from './buildBookResourceModelContextStateValidatorTestCase';
import buildMediaItemResourceModelContextStateValidatorTestCase from './buildMediaItemResourceModelContextStateValidatorTestCase';
import buildPhotographResourceModelContextStateValidatorTestCase from './buildPhotographResourceModelContextStateValidatorTestCase';
import buildPlaylistResourceModelContextStateValidatorTestCase from './buildPlaylistResourceModelContextStateValidatorTestCase';
import buildSongResourceModelContextStateValidatorTestCase from './buildSongResourceModelContextStateValidatorTestCase';
import buildSpatialFeatureResourceModelContextStateValidatorTestCase from './buildSpatialFeatureResourceModelContextStateValidatorTestCase';
import buildVideoResourceModelContextStateValidatorTestCase from './buildVideoResourceModelContextStateValidatorTestCase';

/**
 * @deprecated Create a one-off unit test instead.
 */
export default () => {
    const testCases = [
        buildBibliographicReferenceResourceModelContextStateValidatorTestCase(),
        buildBookResourceModelContextStateValidatorTestCase(),
        buildPhotographResourceModelContextStateValidatorTestCase(),
        buildSpatialFeatureResourceModelContextStateValidatorTestCase(),
        buildAudioItemResourceModelContextStateValidatorTestCase(),
        buildVideoResourceModelContextStateValidatorTestCase(),
        buildSongResourceModelContextStateValidatorTestCase(),
        buildMediaItemResourceModelContextStateValidatorTestCase(),
        buildPlaylistResourceModelContextStateValidatorTestCase(),
    ];

    return testCases;
};
