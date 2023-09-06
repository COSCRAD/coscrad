import { Union, UnionType } from '@coscrad/data-types';

export const EDGE_CONNECTION_CONTEXT_UNION = 'EDGE_CONNECTION_CONTEXT_UNION';

/**
 * We curry the `TypeDecoratorOptoins` as this information may differ which
 * each use. But we fix the union name and discriminant path, as we want these
 * to be cohesive.
 */
export const ContextUnionType = ({ label, description }: { label: string; description: string }) =>
    UnionType(EDGE_CONNECTION_CONTEXT_UNION, { label, description });

@Union(EDGE_CONNECTION_CONTEXT_UNION, 'type')
export class EdgeConnectionContextUnion {}
