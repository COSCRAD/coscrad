import { DeepPartial } from '../../types/DeepPartial';
import { clonePlainObjectWithOverrides } from './clonePlainObjectWithOverrides';

/**
 * WARNING: This may cause performance issues if we overuse this. For now, our
 * only use case is for replacing slugs with UUIDs in `execute-command-stream`.
 * Developing a proper slug system for this would circumvent the need for this
 * utility.
 *
 * @param input the object you would like to modify with the overrides
 * @param deepPath a path that may include dot separators, e.g., 'foo.bar.baz'
 * @param overrideValue the new value you would like for the deep nested path identified by the path
 * @returns
 */
export const cloneWithOverridesByDeepPath = <T extends Object>(
    input: T,
    deepPath: string,
    overrideValue: unknown
): T => {
    if (deepPath.includes('.')) {
        const [baseProperty, ...nestedPropertyPaths] = deepPath.split('.');

        const baseNestedValue = input[baseProperty];

        return clonePlainObjectWithOverrides(input, {
            [baseProperty]: cloneWithOverridesByDeepPath(
                baseNestedValue,
                nestedPropertyPaths.join('.'),
                overrideValue
            ),
        } as DeepPartial<T>);
    }

    const overrides = {
        [deepPath]: overrideValue,
    };

    return clonePlainObjectWithOverrides(input, overrides as DeepPartial<T>);
};
