import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { DTO } from '../../types/DTO';
import { Tag } from '../models/tag/tag.entity';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidTagDTOError from './errors/InvalidTagDTOError';
import TagHasNoTextError from './errors/tag/TagHasNoTextError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const tagValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    if (isNullOrUndefined(dto)) return new InvalidTagDTOError(dto);

    const innerErrors: InternalError[] = [];

    const { label, id } = dto as DTO<Tag>;

    if (!isStringWithNonzeroLength(label)) innerErrors.push(new TagHasNoTextError(id));

    return innerErrors.length ? new InvalidTagDTOError(dto, innerErrors) : Valid;
};

export default tagValidator;
