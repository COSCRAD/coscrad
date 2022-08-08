import { InMemorySnapshot, InMemorySnapshotOfResources, ResourceType } from '../types/ResourceType';

export default (): InMemorySnapshot => ({
    resources: Object.values(ResourceType).reduce(
        (accumulatedSnaphshot: InMemorySnapshotOfResources, resourceType) => ({
            ...accumulatedSnaphshot,
            [resourceType]: [],
        }),
        {}
    ),
    tag: [],
    category: [],
    note: [],
    user: [],
    userGroup: [],
    uuid: [],
});
