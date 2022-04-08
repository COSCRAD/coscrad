import { buildAudioWithTranscriptTestCase } from './audioWithTranscript.domainModelValidatorTestCase';
import { buildBookTestCase } from './book.domainModelValidatorTestCase';
import { buildPhotographTestCase } from './photograph.domainModelValidatorTestCase';
import { buildSpatialFeatureTestCase } from './spatial-feature.domainModelValidatorTestCase';
import { buildTagTestCase } from './tag.domainModelValidatorTestCase';
import { buildTermTestCase } from './term.domainModelValidatorTestCase';
import { buildVocabularyListTestCase } from './vocabularyList.domainModelValidatorTestCase';

export default () => [
    buildAudioWithTranscriptTestCase(),
    buildBookTestCase(),
    buildPhotographTestCase(),
    buildSpatialFeatureTestCase(),
    buildTermTestCase(),
    buildTagTestCase(),
    buildVocabularyListTestCase(),
];
