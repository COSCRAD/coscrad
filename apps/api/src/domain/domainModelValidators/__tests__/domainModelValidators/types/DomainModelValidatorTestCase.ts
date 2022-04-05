import { InternalError } from '../../../../../lib/errors/InternalError';
import { PartialDTO } from '../../../../../types/partial-dto';
import { Entity } from '../../../../models/entity';
import { EntityType } from '../../../../types/entityTypes';
import { DomainModelValidator } from '../../../types/DomainModelValidator';

export type DomainModelValidatorTestCase<TEntity extends Entity> = {
    entityType: EntityType; // TODO correlate this with TEntity
    validator: DomainModelValidator;
    validCases: {
        description?: string;
        dto: PartialDTO<TEntity>;
    }[];
    invalidCases: {
        description?: string;
        invalidDTO: unknown;
        expectedError: InternalError;
    }[];
};
