import { ConfigurableContent } from './data/configurable-content-schema';
import { contentConfig } from './data/content.config';

export const getConfigurableContent = (): ConfigurableContent => {
    /**
     * Note that we used to validate the content config when it was JSON. This is no
     * longer necessary, as it is now a TypeScript file.
     */

    return contentConfig as unknown as ConfigurableContent;
};
