import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { DTO } from '../../types/DTO';
import { Book } from '../models/book/entities/book.entity';
import { resourceTypes } from '../types/resourceTypes';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const bookValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    const allErrors: InternalError[] = [];

    const { title, id, published, pages } = dto as DTO<Book>;

    // TODO fix me
    if (!isStringWithNonzeroLength(title))
        allErrors.push(new InternalError('A book must have a title'));

    if (published && pages.length === 0)
        allErrors.push(new InternalError('You cannot publish a book that has no pages'));

    if (allErrors.length > 0) return new InvalidEntityDTOError(resourceTypes.book, id, allErrors);

    return Valid;
};

export default bookValidator;
