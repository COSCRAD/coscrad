import { IdRouteBuilder } from './id-route-builder';
import { IndexRouteBuilder } from './index-route-builder';

export const IndexAndDetailSubrouteBuilder = (prefix: string) => ({
    index: IndexRouteBuilder(prefix),
    detail: IdRouteBuilder(prefix),
});

// Let's mimic Class-based OOP here
export type IndexAndDetailSubrouteBuilder = ReturnType<typeof IndexAndDetailSubrouteBuilder>;
