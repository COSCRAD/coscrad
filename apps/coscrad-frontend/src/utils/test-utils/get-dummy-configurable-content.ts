import { ConfigurableContent } from '../../configurable-front-matter/data/configurable-content-schema';
import { contentConfig } from '../../configurable-front-matter/data/content.config.SAMPLE';

export const getDummyConfigurableContent = (
    overrides: Partial<ConfigurableContent> = {}
): ConfigurableContent => {
    /**
     * We validate that this is indeed valid in `validateConfigurableContent.spec.ts`.
     * This ensures that we keep the sample up-to-date, while also allowing
     * it to serve as a single dummy configurable content for other tests.
     */
    return { ...contentConfig, ...overrides } as ConfigurableContent;
};
