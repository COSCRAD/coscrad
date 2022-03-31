import { InternalError } from '../../lib/errors/InternalError';
import { EntityType, entityTypes } from '../types/entityTypes';
import tagValidator from './tagValidator';
import termValidator from './termValidator';
import { Valid } from './Valid';
import vocabularyListValidator from './vocabularyListValidator';

export type DomainModelValidator = (inputDTO: unknown) => Valid | InternalError;

// TODO should we put these on the classes and use polymorphism?
export const getValidatorForEntity = (entityType: EntityType): DomainModelValidator => {
    switch (entityType) {
        case entityTypes.tag:
            return tagValidator;

        case entityTypes.term:
            return termValidator;

        case entityTypes.vocabularyList:
            return vocabularyListValidator;

        default:
            throw new InternalError(
                `Failed to get validator for unknown entity type: ${entityType}`
            );
    }
};

export default {
    termValidator,
    vocabularyListValidator,
};
