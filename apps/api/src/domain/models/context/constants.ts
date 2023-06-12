import { Union } from '@coscrad/data-types';

export const EDGE_CONNECTION_CONTEXT_UNION = 'EDGE_CONNECTION_CONTEXT_UNION';

/**
 * This is a decorator (the returned value of a decorator factory). We export
 * this here for reuse in `EdgeConnection` command payloads.
 */
export const ContextUnion = ({ label, description }: { label: string; description: string }) =>
    Union(EDGE_CONNECTION_CONTEXT_UNION, 'type', { label, description });
