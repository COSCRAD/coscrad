import { buildBookTestCase } from './book.domainModelValidatorTestCase';
import { buildPhotographTestCase } from './photograph.domainModelValidatorTestCase';
import { buildSpatialFeatureTestCase } from './spatial-feature.domainModelValidatorTestCase';
import { buildTermTestCase } from './term.domainModelValidatorTestCase';
import { buildTranscribedAudioTestCase } from './transcribedAudio.domainModelValidatorTestCase';
import { buildVocabularyListTestCase } from './vocabularyList.domainModelValidatorTestCase';

export default () => [
    buildTranscribedAudioTestCase(),
    buildBookTestCase(),
    buildPhotographTestCase(),
    buildSpatialFeatureTestCase(),
    buildTermTestCase(),
    buildVocabularyListTestCase(),
];
