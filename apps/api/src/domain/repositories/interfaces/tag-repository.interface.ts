import { Tag } from '../../models/tag/tag.entity';
import { IRepositoryForAggregate } from './repository-for-aggregate';

export type TagRepository = IRepositoryForAggregate<Tag>;
