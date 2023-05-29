import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { COSCRADLogo } from './coscrad-logo';

const coscradLogoUrl = 'coscrad-logo.png';

const act = () =>
    renderWithProviders(<COSCRADLogo />, {
        contentConfig: getDummyConfigurableContent({
            coscradLogoUrl: coscradLogoUrl,
        }),
    });

describe('COSCRADLogo', () => {
    it('should render the logo image successfully', () => {
        const { baseElement } = act();

        expect(baseElement).toBeTruthy();
    });

    it('should display the logo image', () => {
        const { baseElement } = act();

        const logo = baseElement.querySelector('img');

        expect(logo.src).toContain(coscradLogoUrl);
    });
});
