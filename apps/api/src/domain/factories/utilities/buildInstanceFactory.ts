import { DomainModelCtor } from 'apps/api/src/lib/types/DomainModelCtor';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
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

        // We must cast unless we can use the validator as a type guard
        return new Ctor(dto as PartialDTO<TEntity>);
    };
