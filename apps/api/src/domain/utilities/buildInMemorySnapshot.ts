import { DeepPartial } from '../../types/DeepPartial';
import { InMemorySnapshot, InMemorySnapshotOfResources } from '../types/ResourceType';
import buildEmptyInMemorySnapshot from './buildEmptyInMemorySnapshot';

const emptySnapshot = buildEmptyInMemorySnapshot();

const emptySnapshotOfResources = emptySnapshot.resources;

export default ({
    resources,
    tags,
    connections,
    categoryTree,
}: DeepPartial<InMemorySnapshot>): InMemorySnapshot =>
    ({
        resources: Object.entries(resources || {}).reduce(
            (snapshotOfResources: InMemorySnapshotOfResources, [key, models]) => ({
                ...snapshotOfResources,
                [key]: models,
            }),
            emptySnapshotOfResources
        ),
        tags: tags || [],
        connections: connections || [],
        categoryTree: categoryTree || [],
    } as InMemorySnapshot);
