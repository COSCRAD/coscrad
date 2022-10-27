import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { NavBar } from './NavBar';

describe('NavBar', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
