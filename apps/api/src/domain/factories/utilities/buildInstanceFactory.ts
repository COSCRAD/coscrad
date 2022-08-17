import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { DTO } from '../../../types/DTO';
import NullOrUndefinedAggregateDTOError from '../../domainModelValidators/errors/NullOrUndefinedAggregateDTOError';
import { isValid } from '../../domainModelValidators/Valid';
import { Aggregate } from '../../models/aggregate.entity';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import { InstanceFactory } from '../getInstanceFactoryForResource';

/**
 * This is the single source of truth for how to safely build a new aggregate
 * instance from a dto (created from a database document or command payload, for example).
 * The factory will return
 * - An `InvariantValidationError` with specific inner error(s), if the dto
 * is invalid
 * - A valid instance created from the dto, if the dto is valid
 */
export default <TEntity extends Aggregate = Aggregate>(
        Ctor: DomainModelCtor<TEntity>
    ): InstanceFactory<TEntity> =>
    (dto: unknown) => {
        const candidateInstance = new Ctor(dto as DTO<TEntity>);

        const { type } = candidateInstance;

        if (isNullOrUndefined(dto)) return new NullOrUndefinedAggregateDTOError(type);

        const validationResult = candidateInstance.validateInvariants();

        // Maybe this is where we should wrap the top level error instead?
        if (!isValid(validationResult)) return validationResult;

        // We must cast unless we can make the validator into a type guard
        return new Ctor(dto as DTO<TEntity>);
    };
