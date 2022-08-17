import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResourceType, ResourceTypeToResourceModel } from '../../../types/ResourceType';

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

export type DomainModelValidatorTestCase<TResourceType extends ResourceType> = {
    resourceType: TResourceType;
    validCases: {
        description?: string;
        dto: DTO<ResourceTypeToResourceModel[TResourceType]>;
    }[];
    invalidCases: DomainModelValidatorInvalidTestCase<ResourceTypeToResourceModel[TResourceType]>[];
};
