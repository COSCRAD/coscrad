import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { DTO } from '../../types/DTO';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';
import { resourceTypes } from '../types/resourceTypes';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidPublicationStatusError from './errors/InvalidPublicationStatusError';
import NullOrUndefinedResourceDTOError from './errors/NullOrUndefinedResourceDTOError';
import InvalidVocabularyListDTOError from './errors/vocabularyList/InvalidVocabularyListDTOError';
import VocabularyListHasNoEntriesError from './errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from './errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const vocabularyListValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    // Return early, as we will get null pointers if we proceed
    if (isNullOrUndefined(dto)) return new NullOrUndefinedResourceDTOError(resourceTypes.term);

    const innerErrors: InternalError[] = [];

    const { name, nameEnglish, id, entries, published } = dto as DTO<VocabularyList>;

    if (!isStringWithNonzeroLength(name) && !isStringWithNonzeroLength(nameEnglish))
        innerErrors.push(new VocabularyListHasNoNameInAnyLanguageError(id));

    if (!Array.isArray(entries) || !entries.length)
        innerErrors.push(new VocabularyListHasNoEntriesError(id));

    // TODO validate that `variables` is an array (could be empty)

    // TODO Validate inherited properties on the base class
    if (typeof published !== 'boolean')
        innerErrors.push(new InvalidPublicationStatusError(resourceTypes.term));

    return innerErrors.length ? new InvalidVocabularyListDTOError(id, innerErrors) : Valid;
};

export default vocabularyListValidator;
