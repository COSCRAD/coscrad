import { InternalError } from '../../lib/errors/InternalError';
import { DTO } from '../../types/DTO';
import { Book } from '../models/book/entities/book.entity';

const bookValidator = (dto: unknown): InternalError[] => {
    const allErrors: InternalError[] = [];

    const { published, pages } = dto as DTO<Book>;

    if (published && pages.length === 0)
        allErrors.push(new InternalError('You cannot publish a book that has no pages'));

    return allErrors;
};

export default bookValidator;
