import { DeepPartial } from '../../types/DeepPartial';
import { InMemorySnapshot, InMemorySnapshotOfResources } from '../types/ResourceType';
import buildEmptyInMemorySnapshot from './buildEmptyInMemorySnapshot';

const emptySnapshot = buildEmptyInMemorySnapshot();

const emptySnapshotOfResources = emptySnapshot.resources;

/**
 * @deprecated Use `DeluxeInMemoryStore` instead.
 */
export default ({
    resources,
    tag: tags,
    note: connections,
    category: categoryTree,
    user: users,
    userGroup: userGroups,
    contributor: contributors,
}: DeepPartial<InMemorySnapshot>): InMemorySnapshot =>
    ({
        resources: Object.entries(resources || {}).reduce(
            (snapshotOfResources: InMemorySnapshotOfResources, [key, models]) => ({
                ...snapshotOfResources,
                [key]: models,
            }),
            emptySnapshotOfResources
        ),
        tag: tags || [],
        note: connections || [],
        category: categoryTree || [],
        user: users || [],
        userGroup: userGroups || [],
        contributor: contributors || [],
    } as InMemorySnapshot);
