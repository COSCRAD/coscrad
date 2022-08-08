import { ValueType } from '../../lib/types/valueType';
import { Category } from '../models/categories/entities/category.entity';
import { EdgeConnection } from '../models/context/edge-connection.entity';
import { Tag } from '../models/tag/tag.entity';
import { CoscradUserGroup } from '../models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../models/user-management/user/entities/user/coscrad-user.entity';
import { CategorizableType } from './CategorizableType';
import { ResourceTypeToResourceModel } from './ResourceType';

export const AggregateType = {
    ...CategorizableType,
    tag: 'tag',
    category: 'category',
    user: 'user',
    userGroup: 'userGroup',
} as const;

export type AggregateType = ValueType<typeof AggregateType>;

export type AggregateTypeToAggregateInstance = ResourceTypeToResourceModel & {
    [AggregateType.category]: Category;
    [AggregateType.tag]: Tag;
    [AggregateType.note]: EdgeConnection;
    [AggregateType.user]: CoscradUser;
    [AggregateType.userGroup]: CoscradUserGroup;
};

export const isAggregateType = (input: unknown): input is AggregateType =>
    Object.values(AggregateType).some((aggregateType) => aggregateType === input);
