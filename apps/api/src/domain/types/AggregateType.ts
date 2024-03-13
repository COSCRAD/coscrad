import { Category } from '../models/categories/entities/category.entity';
import { EdgeConnection } from '../models/context/edge-connection.entity';
import { Tag } from '../models/tag/tag.entity';
import { CoscradContributor } from '../models/user-management/contributor/entities/coscrad-contributor.entity';
import { CoscradUserGroup } from '../models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../models/user-management/user/entities/user/coscrad-user.entity';
import { ResourceTypeToResourceModel } from './ResourceType';

import { AggregateType, isAggregateType } from '@coscrad/api-interfaces';

export { AggregateType, isAggregateType };

export type AggregateTypeToAggregateInstance = ResourceTypeToResourceModel & {
    [AggregateType.category]: Category;
    [AggregateType.tag]: Tag;
    [AggregateType.note]: EdgeConnection;
    [AggregateType.user]: CoscradUser;
    [AggregateType.userGroup]: CoscradUserGroup;
    [AggregateType.contributor]: CoscradContributor;
};
