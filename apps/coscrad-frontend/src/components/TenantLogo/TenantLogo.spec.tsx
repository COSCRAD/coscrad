import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/getDummyConfigurableContent';
import { TenantLogo } from './TenantLogo';

describe('Tenant Logo', () => {
    it('should load the logo url from configurable content', async () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const organizationLogoUrl = 'https://mysite.com/org_url.png';
        const myConfigurableContent = { ...dummyConfigurableContent, organizationLogoUrl };

        const { baseElement } = renderWithProviders(<TenantLogo />, {
            contentConfig: myConfigurableContent,
        });

        const logo = baseElement.querySelector('img');
        expect(logo.src).toContain(organizationLogoUrl);
    });
});
