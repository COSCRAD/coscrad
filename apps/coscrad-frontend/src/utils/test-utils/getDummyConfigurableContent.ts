import { ConfigurableContent } from '../../configurable-front-matter/data/configurableContentSchema';

export const getDummyConfigurableContent = (): ConfigurableContent => ({
    siteTitle: 'My Site',

    subTitle: 'Where it all Happens',

    about: 'Just a Test',

    siteDescription: 'This is my testing site',

    siteHomeImageUrl: 'https://mysite.com/image.png',

    copyrightHolder: 'ME',

    organizationLogoUrl: 'https://mysite.com/logo.png',
});
