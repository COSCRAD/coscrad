import { buildAudioWithTranscriptTestCase } from './audioWithTranscript.domainModelValidatorTestCase';
import { buildTagTestCase } from './tag.domainModelValidatorTestCase';
import { buildTermTestCase } from './term.domainModelValidatorTestCase';
import { buildVocabularyListTestCase } from './vocabularyList.domainModelValidatorTestCase';

export default () => [
    buildAudioWithTranscriptTestCase(),
    buildTermTestCase(),
    buildTagTestCase(),
    buildVocabularyListTestCase(),
];
