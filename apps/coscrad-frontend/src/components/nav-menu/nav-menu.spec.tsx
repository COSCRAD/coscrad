import { MemoryRouter } from 'react-router-dom';
import { hexToRgb } from '../../utils/math/colors';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { NavMenuContainer } from './nav-menu-container';
import { NavMenuPresenter } from './nav-menu-presenter';

/**
 *
 * This is just a sanity check for now.  When we implement the container and
 * presenter separation we can test more thoroughly.
 * We probably also want Cypress tests to ensure the navigation works:
 * https://www.pivotaltracker.com/story/show/184576697
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

    it('should apply the custom backgroundColor', () => {
        const dummyColor = '#3440eb';

        const expectedColor = hexToRgb(dummyColor);

        const dummyConfigurableContent = getDummyConfigurableContent({
            themeOverrides: {
                palette: {
                    primary: {
                        main: dummyColor,
                    },
                },
            },
        });

        renderWithProviders(
            <MemoryRouter>
                <NavMenuPresenter navItemInfos={[]} />
            </MemoryRouter>,
            {
                contentConfig: dummyConfigurableContent,
            }
        );

        const NavMenuPresenterEl = document.querySelector(`[data-testid="nav-menu-presenter"]`);

        const style = window.getComputedStyle(NavMenuPresenterEl);

        expect(style.backgroundColor).toBe(expectedColor);
    });
});
