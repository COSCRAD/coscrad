import BaseDomainModel from '../../domain/models/base-domain-model.entity';
import { DTO } from '../../types/DTO';

export type DomainModelCtor<TEntity extends BaseDomainModel = BaseDomainModel> = new (
    dto: DTO<TEntity>
) => TEntity;
