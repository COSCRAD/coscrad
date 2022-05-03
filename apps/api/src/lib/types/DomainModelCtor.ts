import BaseDomainModel from '../../domain/models/BaseDomainModel';
import { DTO } from '../../types/DTO';

export type DomainModelCtor<TEntity extends BaseDomainModel> = new (dto: DTO<TEntity>) => TEntity;
