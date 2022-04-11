import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { PartialDTO } from '../../types/partial-dto';
import { Tag } from '../models/tag/tag.entity';
import { resourceTypes } from '../types/resourceTypes';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import InvalidPublicationStatusError from './errors/InvalidPublicationStatusError';
import NullOrUndefinedDTOError from './errors/NullOrUndefinedDTOError';
import TagHasNoTextError from './errors/tag/TagHasNoTextError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const tagValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    if (isNullOrUndefined(dto))
        return new InvalidEntityDTOError(resourceTypes.tag, undefined, [
            new NullOrUndefinedDTOError(resourceTypes.tag),
        ]);

    const innerErrors: InternalError[] = [];

    const { text, id, published } = dto as PartialDTO<Tag>;

    if (!isStringWithNonzeroLength(text)) innerErrors.push(new TagHasNoTextError(id));

    // TODO Validate inherited properties on the base class
    if (typeof published !== 'boolean')
        innerErrors.push(new InvalidPublicationStatusError(resourceTypes.tag));

    return innerErrors.length
        ? new InvalidEntityDTOError(resourceTypes.tag, id, innerErrors)
        : Valid;
};

export default tagValidator;
