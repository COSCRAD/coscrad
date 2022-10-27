import { renderWithProviders } from '../../utils/test-utils';
import { NavBar } from './NavBar';

describe('NavBar', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<NavBar />);
        expect(baseElement).toBeTruthy();
    });
});
