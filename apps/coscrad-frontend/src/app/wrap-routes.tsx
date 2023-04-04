import { CoscradRoute } from './build-routes';

/**
 * A RouteWrapper is an element that wraps a route to participate in UI nesting,
 * but does not contribute to the URL.
 *
 * React Router calls this a `Layout Route`. This naming collides with our use
 * of the term "layout".
 *
 * https://reactrouter.com/en/main/route/route#layout-routes
 */
type RouteWrapper = Omit<CoscradRoute, 'path' | 'children'> & {
    children?: RouteWrapper[];
};

export const wrapRoutes = (
    routesToWrap: RouteWrapper[],
    ...wrapperRoutes: RouteWrapper[]
): RouteWrapper =>
    // @ts-expect-error TODO Fix types here
    wrapperRoutes.reduce(
        (acc, nextWrapper) =>
            Array.isArray(acc)
                ? {
                      ...nextWrapper,
                      children: acc,
                  }
                : {
                      ...nextWrapper,
                      children: [acc],
                  },
        routesToWrap
    );
