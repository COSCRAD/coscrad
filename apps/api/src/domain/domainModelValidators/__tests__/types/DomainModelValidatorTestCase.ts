import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResourceType } from '../../../types/ResourceType';
import { DomainModelValidator } from '../../types/DomainModelValidator';

export type DomainModelValidatorInvalidTestCase<TEntity> = {
    description?: string;
    /**
     * Actually, this is unknown, but it's usually one-step away from a valid
     * model, so the type inference is helpful. Casting an invalid DTO
     * in the test case builder is probably the lesser evil.
     */
    invalidDTO: Partial<DTO<TEntity>>;
    expectedError: InternalError;
};

export type DomainModelValidatorTestCase<TResource> = {
    resourceType: ResourceType; // TODO correlate this with TEntity
    validator: DomainModelValidator;
    validCases: {
        description?: string;
        dto: DTO<TResource>;
    }[];
    invalidCases: DomainModelValidatorInvalidTestCase<TResource>[];
};
