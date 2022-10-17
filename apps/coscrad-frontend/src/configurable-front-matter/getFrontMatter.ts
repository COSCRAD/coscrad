import { ConfigurableContent } from './data/configSchema';
import rawData from './data/configurable-front-matter.json';
import { validateConfigurableContent } from './validation/validateConfigurableContent';

export default (): ConfigurableContent => {
    const validationResult = validateConfigurableContent(rawData);

    if (validationResult.length > 0) {
        const msg = `Invalid front matter data encountered. \n Error: ${validationResult}`;

        /**
         * This is not a returned error. We want to fail fast if the system is
         * using an invalid config.
         */
        throw new Error(msg);
    }

    return rawData as ConfigurableContent;
};
