import { ConfigurableContent } from './data/configurableContentSchema';
import { contentConfig } from './data/content.config';
import { InvalidContentConfigurationException } from './errorHandling/exceptions/InvalidContentConfigurationException';
import { validateConfigurableContent } from './validation/validateConfigurableContent';

export const getConfigurableContent = (): ConfigurableContent => {
    const validationResult = validateConfigurableContent(contentConfig);

    if (validationResult.length > 0) {
        throw new InvalidContentConfigurationException(validationResult);
    }

    return contentConfig as unknown as ConfigurableContent;
};
