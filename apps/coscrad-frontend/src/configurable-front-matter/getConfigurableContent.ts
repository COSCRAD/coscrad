import rawData from './data/configurable-front-matter.json';
import { ConfigurableContent } from './data/configurableContentSchema';
import { InvalidContentConfigurationException } from './errorHandling/exceptions/InvalidContentConfigurationException';
import { validateConfigurableContent } from './validation/validateConfigurableContent';

export const getConfigurableContent = (): ConfigurableContent => {
    const validationResult = validateConfigurableContent(rawData);

    if (validationResult.length > 0) {
        throw new InvalidContentConfigurationException(validationResult);
    }

    return rawData as ConfigurableContent;
};
