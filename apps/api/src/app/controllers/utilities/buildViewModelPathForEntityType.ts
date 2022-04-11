import { EntityType, entityTypes } from 'apps/api/src/domain/types/entityTypes';

// For irregular plural forms or forms that lead to awkward grammar
const exceptions: Partial<Record<EntityType, string>> = {
    [entityTypes.transcribedAudio]: 'transcribedAudioItems',
};

export default (entityType: EntityType): string => exceptions[entityType] || `${entityType}s`;
