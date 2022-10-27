import { renderWithProviders } from '../../utils/test-utils';
import { Footer } from './Footer';

describe('Footer', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<Footer />);
        expect(baseElement).toBeTruthy();
    });
});
