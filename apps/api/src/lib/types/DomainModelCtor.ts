import { DTO } from '../../types/DTO';

export type DomainModelCtor<TEntity = unknown> = new (dto: DTO<TEntity>) => TEntity;
