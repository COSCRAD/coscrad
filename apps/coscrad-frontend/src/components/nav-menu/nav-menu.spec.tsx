import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { NavMenuContainer } from './nav-menu-container';

/**
 *
 * This is just a sanity check for now.  When we implement the container and
 * presenter separation we can test more thoroughly.
 * We probably also want Cypress tests to ensure the navigation works
 *
 */
describe('Nav Menu', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <NavMenuContainer />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
