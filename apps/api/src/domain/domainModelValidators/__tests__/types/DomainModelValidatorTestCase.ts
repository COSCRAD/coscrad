import { InternalError } from '../../../../lib/errors/InternalError';
import { PartialDTO } from '../../../../types/partial-dto';
import { ResourceType } from '../../../types/resourceTypes';
import { DomainModelValidator } from '../../types/DomainModelValidator';

export type DomainModelValidatorInvalidTestCase<TEntity> = {
    description?: string;
    /**
     * Actually, this is unknown, but it's usually one-step away from a valid
     * model, so the type inference is helpful. Casting an invalid DTO
     * in the test case builder is probably the lesser evil.
     */
    invalidDTO: PartialDTO<TEntity>;
    expectedError: InternalError;
};

export type DomainModelValidatorTestCase<TResource> = {
    resourceType: ResourceType; // TODO correlate this with TEntity
    validator: DomainModelValidator;
    validCases: {
        description?: string;
        dto: PartialDTO<TResource>;
    }[];
    invalidCases: DomainModelValidatorInvalidTestCase<TResource>[];
};
