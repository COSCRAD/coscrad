import { buildBibliographicReferenceTestCase } from './bibliographic-reference.domainModelValidatorTestCase';
import { buildBookTestCase } from './book.domainModelValidatorTestCase';
import { buildPhotographTestCase } from './photograph.domainModelValidatorTestCase';
import { buildSongTestCase } from './song.domainModelValidatorTestCase';
import { buildSpatialFeatureTestCase } from './spatial-feature.domainModelValidatorTestCase';
import { buildTermTestCase } from './term.domainModelValidatorTestCase';
import { buildTranscribedAudioTestCase } from './transcribedAudio.domainModelValidatorTestCase';
import { buildVocabularyListTestCase } from './vocabularyList.domainModelValidatorTestCase';

export default () => [
    buildBibliographicReferenceTestCase(),
    buildTranscribedAudioTestCase(),
    buildBookTestCase(),
    buildPhotographTestCase(),
    buildSpatialFeatureTestCase(),
    buildTermTestCase(),
    buildVocabularyListTestCase(),
    buildSongTestCase(),
];
