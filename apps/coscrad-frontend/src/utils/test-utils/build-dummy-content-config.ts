import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ConfigurableContent } from '../../configurable-front-matter/data/configurable-content-schema';
import { getDummyConfigurableContent } from './get-dummy-configurable-content';

const dummyConfigWithAllProps = getDummyConfigurableContent();

export const buildDummyConfig = (userOverrides: Partial<ConfigurableContent> = {}) => {
    const propertiesToRemove = Object.entries(userOverrides)
        .filter(([_key, value]) => isNullOrUndefined(value))
        .map(([key, _value]) => key);

    // Note that this is a shallow clone
    const withUserOverrides = { ...dummyConfigWithAllProps, ...userOverrides };

    /**
     * We remove null or undefined valued properties to fully mimic the
     * behaviour of leaving the property off the config entirely.
     */
    propertiesToRemove.forEach((key) => delete withUserOverrides[key]);

    return withUserOverrides;
};
