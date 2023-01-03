import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { NavBar } from './nav-bar';

/**
 *
 * This is just a sanity check for now.  When we implement the container and
 * presenter separation we can test more thoroughly.
 * We probably also want Cypress tests to ensure the navigation works
 *
 */
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
