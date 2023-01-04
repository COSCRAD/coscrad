import { renderWithProviders } from '../../utils/test-utils';
import { COSCRADLogo } from './coscrad-logo';

describe('COSCRADLogo', () => {
    it('should render the logo image successfully', () => {
        const { baseElement } = renderWithProviders(<COSCRADLogo />);

        expect(baseElement).toBeTruthy();
    });
    it('should display the logo image', () => {
        const { baseElement } = renderWithProviders(<COSCRADLogo />);
        const logo = baseElement.querySelector('img');

        expect(logo.src).toContain('coscrad-logo.png');
    });
});
