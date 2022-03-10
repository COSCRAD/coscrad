import { DomainModelValidator } from '.';
import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { PartialDTO } from '../../types/partial-dto';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';
import { entityTypes } from '../types/entityType';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidPublicationStatusError from './errors/InvalidPublicationStatusError';
import NullOrUndefinedDTOError from './errors/NullOrUndefinedDTOError';
import InvalidVocabularyListDTOError from './errors/vocabularyList/InvalidVocabularyListDTOError';
import VocabularyListHasNoEntriesError from './errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from './errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import { Valid } from './Valid';

const vocabularyListValidator: DomainModelValidator = (
  dto: unknown
): Valid | InternalError => {
  // Return early, as we will get null pointers if we proceed
  if (isNullOrUndefined(dto))
    return new NullOrUndefinedDTOError(entityTypes.term);

  const innerErrors: InternalError[] = [];

  const { name, nameEnglish, id, entries, published } =
    dto as PartialDTO<VocabularyList>;

  if (
    !isStringWithNonzeroLength(name) &&
    !isStringWithNonzeroLength(nameEnglish)
  )
    innerErrors.push(new VocabularyListHasNoNameInAnyLanguageError(id));

  if (!Array.isArray(entries) || !entries.length)
    innerErrors.push(new VocabularyListHasNoEntriesError(id));

  // TODO Validate inherited properties on the base class
  if (typeof published !== 'boolean')
    innerErrors.push(new InvalidPublicationStatusError(entityTypes.term));

  return innerErrors.length
    ? new InvalidVocabularyListDTOError(id, innerErrors)
    : Valid;
};

export default vocabularyListValidator;
