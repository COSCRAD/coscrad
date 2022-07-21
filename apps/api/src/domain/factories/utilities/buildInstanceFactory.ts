import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { DTO } from '../../../types/DTO';
import { DomainModelValidator } from '../../domainModelValidators/types/DomainModelValidator';
import { isValid } from '../../domainModelValidators/Valid';
import BaseDomainModel from '../../models/BaseDomainModel';
import { InstanceFactory } from '../getInstanceFactoryForEntity';

export default <TEntity extends BaseDomainModel = BaseDomainModel>(
        validator: DomainModelValidator,
        Ctor: DomainModelCtor<TEntity>
    ): InstanceFactory<TEntity> =>
    (dto: unknown) => {
        const validationResult = validator(dto);

        if (!isValid(validationResult)) return validationResult;

        // We must cast unless we can make the validator into a type guard
        return new Ctor(dto as DTO<TEntity>);
    };
