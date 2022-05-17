import { isStringWithNonzeroLength } from '@coscrad/validation';
import { InternalError } from '../../lib/errors/InternalError';
import { DTO } from '../../types/DTO';
import { Photograph } from '../models/photograph/entities/photograph.entity';
import { resourceTypes } from '../types/resourceTypes';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import NullOrUndefinedResourceDTOError from './errors/NullOrUndefinedResourceDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const photographValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    if (isNullOrUndefined(dto))
        return new NullOrUndefinedResourceDTOError(resourceTypes.photograph);

    const allErrors: InternalError[] = [];

    const { photographer, id, dimensions } = dto as DTO<Photograph>;

    if (!isStringWithNonzeroLength(photographer))
        allErrors.push(new InternalError(`The photographer must be specified`));

    // TODO Break out a separate validator for the nested `PhotographDimensions` type
    const { widthPX, heightPX } = dimensions;

    if (heightPX < 0)
        allErrors.push(new InternalError(`A photograph cannot have a negative height`));

    if (widthPX < 0) allErrors.push(new InternalError(`A photograph cannot have a negative width`));

    return allErrors.length > 0
        ? new InvalidEntityDTOError(resourceTypes.photograph, id, allErrors)
        : Valid;
};

export default photographValidator;
