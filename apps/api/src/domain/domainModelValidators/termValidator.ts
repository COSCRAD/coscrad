import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { Term } from '../models/term/entities/term.entity';
import { resourceTypes } from '../types/resourceTypes';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidPublicationStatusError from './errors/InvalidPublicationStatusError';
import NullOrUndefinedResourceDTOError from './errors/NullOrUndefinedResourceDTOError';
import InvalidTermDTOError from './errors/term/InvalidTermDTOError';
import TermHasNoTextInAnyLanguageError from './errors/term/TermHasNoTextInAnyLanguageError';
import { DomainModelValidator } from './types/DomainModelValidator';
import validateSimpleInvariants from './utilities/validateSimpleInvariants';
import { Valid } from './Valid';

const termValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    // Return early, as we will get null pointers if we proceed
    if (isNullOrUndefined(dto)) return new NullOrUndefinedResourceDTOError(resourceTypes.term);

    const innerErrors: InternalError[] = [];

    const { term, termEnglish, id, published } = dto as Term;

    innerErrors.push(...validateSimpleInvariants(Term, dto));

    if (!isStringWithNonzeroLength(term) && !isStringWithNonzeroLength(termEnglish))
        innerErrors.push(new TermHasNoTextInAnyLanguageError(id));

    // TODO Validate inherited properties on the base class
    if (typeof published !== 'boolean')
        innerErrors.push(new InvalidPublicationStatusError(resourceTypes.term));

    return innerErrors.length ? new InvalidTermDTOError(id, innerErrors) : Valid;
};

export default termValidator;
