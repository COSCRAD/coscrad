import { InternalError } from '../../../../../lib/errors/InternalError';
import { PartialDTO } from '../../../../../types/partial-dto';
import { Entity } from '../../../../models/entity';
import { EntityType } from '../../../../types/entityTypes';
import { DomainModelValidator } from '../../../types/DomainModelValidator';

export type DomainModelValidatorInvalidTestCase<TEntity extends Entity> = {
    description?: string;
    /**
     * Actually, this is unknown, but it's usually one-step away from a valid
     * model, so the type inference is helpful. Casting an invalid DTO
     * in the test case builder is probably the lesser evil.
     */
    invalidDTO: PartialDTO<TEntity>;
    expectedError: InternalError;
};

export type DomainModelValidatorTestCase<TEntity extends Entity> = {
    entityType: EntityType; // TODO correlate this with TEntity
    validator: DomainModelValidator;
    validCases: {
        description?: string;
        dto: PartialDTO<TEntity>;
    }[];
    invalidCases: DomainModelValidatorInvalidTestCase<TEntity>[];
};
