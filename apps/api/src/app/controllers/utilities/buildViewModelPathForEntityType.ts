import { EntityType } from 'apps/api/src/domain/types/entityTypes';

// We can deal with irregular plurals when that becomes a problem.
export default (entityType: EntityType): string => `${entityType}s`;
