import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { PartialDTO } from '../../types/partial-dto';
import { Book } from '../models/book/entities/book.entity';
import BookPage from '../models/book/entities/BookPage';
import { entityTypes } from '../types/entityTypes';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const bookValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    const allErrors: InternalError[] = [];

    const { title, id, published, pages } = dto as PartialDTO<Book>;

    // TODO fix me
    if (!isStringWithNonzeroLength(title))
        allErrors.push(new InternalError('A book must have a title'));

    if (published && (pages as BookPage[]).length === 0)
        allErrors.push(new InternalError('You cannot publish a book that has no pages'));

    if (allErrors.length > 0) return new InvalidEntityDTOError(entityTypes.book, id, allErrors);

    return Valid;
};

export default bookValidator;
