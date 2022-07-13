import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { DTO } from '../../../types/DTO';
import { isValid } from '../../domainModelValidators/Valid';
import { Aggregate } from '../../models/aggregate.entity';
import { InstanceFactory } from '../getInstanceFactoryForResource';

export default <TEntity extends Aggregate = Aggregate>(
        Ctor: DomainModelCtor<TEntity>
    ): InstanceFactory<TEntity> =>
    (dto: unknown) => {
        const candidateInstance = new Ctor(dto as DTO<TEntity>);

        const validationResult = candidateInstance.validateInvariants();

        if (!isValid(validationResult)) return validationResult;

        // We must cast unless we can make the validator into a type guard
        return new Ctor(dto as DTO<TEntity>);
    };
