import { MemoryRouter } from 'react-router-dom';
import { hexToRgb } from '../../utils/math/colors';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import LogoutButton from './logout-button';

describe('loginbutton', () => {
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
                <LogoutButton />
            </MemoryRouter>,
            {
                contentConfig: dummyConfigurableContent,
            }
        );

        const LogoutButtonEl = document.querySelector(`[data-testid="app-bar"]`);

        const style = window.getComputedStyle(LogoutButtonEl);

        expect(style.backgroundColor).toBe(expectedColor);
    });
});
