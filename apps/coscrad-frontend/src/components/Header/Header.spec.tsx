import { renderWithProviders } from '../../utils/test-utils';
import { Header } from './Header';

describe('Header', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<Header />);
        expect(baseElement).toBeTruthy();
    });
});
