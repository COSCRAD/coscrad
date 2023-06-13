import { Union } from '@coscrad/data-types';

export const EDGE_CONNECTION_CONTEXT_UNION = 'EDGE_CONNECTION_CONTEXT_UNION';

/**
 * We curry the `TypeDecoratorOptoins` as this information may differ which
 * each use. But we fix the union name and discriminant path, as we want these
 * to be cohesive.
 */
export const ContextUnion = ({ label, description }: { label: string; description: string }) =>
    Union(EDGE_CONNECTION_CONTEXT_UNION, 'type', { label, description });
