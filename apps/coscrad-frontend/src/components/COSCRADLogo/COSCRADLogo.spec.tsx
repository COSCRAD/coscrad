import { renderWithProviders } from '../../utils/test-utils';
import { COSCRADLogo } from './COSCRADLogo';

describe('COSCRADLogo', () => {
    it('should render the logo image successfully', () => {
        const { baseElement } = renderWithProviders(<COSCRADLogo />);
        expect(baseElement).toBeTruthy();
    });
    test('the logo image should display', () => {
        const { baseElement } = renderWithProviders(<COSCRADLogo />);
        const logo = baseElement.querySelector('img');
        expect(logo.src).toContain('coscrad-logo.png');
    });
});
