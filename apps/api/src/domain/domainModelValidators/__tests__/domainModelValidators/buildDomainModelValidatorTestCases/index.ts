import { buildTagTestCase } from './tag.domainModelValidatorTestCase';
import { buildTermTestCase } from './term.domainModelValidatorTestCase';
import { buildVocabularyListTestCase } from './vocabularyList.domainModelValidatorTestCase';

export default () => [buildTermTestCase(), buildTagTestCase(), buildVocabularyListTestCase()];
