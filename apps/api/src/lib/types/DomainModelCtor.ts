import { Resource } from '../../domain/models/resource.entity';
import { DTO } from '../../types/DTO';

export type DomainModelCtor<TEntity extends Resource> = new (dto: DTO<TEntity>) => TEntity;
