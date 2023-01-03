import { ConfigurableContent } from './data/configurable-content-schema';
import { contentConfig } from './data/content.config';
import { InvalidContentConfigurationException } from './errorHandling/exceptions/invalid-content-configuration.exception';
import { validateConfigurableContent } from './validation/validate-configurable-content';

export const getConfigurableContent = (): ConfigurableContent => {
    const validationResult = validateConfigurableContent(contentConfig);

    if (validationResult.length > 0) {
        throw new InvalidContentConfigurationException(validationResult);
    }

    return contentConfig as unknown as ConfigurableContent;
};
