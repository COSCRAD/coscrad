import { isNullOrUndefined } from '@coscrad/validation-constraints';

// The filters are the `source of truth`. Superfluous props in values ignored.
export default (
    values: Record<string, string | boolean>,
    filters: Record<string, string | boolean>,
    matcher: (value1: string | boolean, value2: string | boolean) => boolean = (v1, v2) => v1 === v2
): boolean =>
    !isNullOrUndefined(filters) &&
    Object.entries(filters).every(([propertyName, value]) => matcher(values[propertyName], value));
