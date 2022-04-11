import { Resource } from '../../domain/models/resource.entity';
import { PartialDTO } from '../../types/partial-dto';

export type DomainModelCtor<TEntity extends Resource> = new (dto: PartialDTO<TEntity>) => TEntity;
