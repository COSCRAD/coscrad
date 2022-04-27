import { DomainModelCtor } from 'apps/api/src/lib/types/DomainModelCtor';
import { DTO } from 'apps/api/src/types/DTO';
import { DomainModelValidator } from '../../domainModelValidators/types/DomainModelValidator';
import { isValid } from '../../domainModelValidators/Valid';
import { Resource } from '../../models/resource.entity';
import { InstanceFactory } from '../getInstanceFactoryForEntity';

export default <TEntity extends Resource = Resource>(
        validator: DomainModelValidator,
        Ctor: DomainModelCtor<TEntity>
    ): InstanceFactory<TEntity> =>
    (dto: unknown) => {
        const validationResult = validator(dto);

        if (!isValid(validationResult)) return validationResult;

        // We must cast unless we can make the validator into a type guard
        return new Ctor(dto as DTO<TEntity>);
    };
