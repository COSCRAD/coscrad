import { MemoryRouter } from 'react-router-dom';
import { hexToRgb } from '../../utils/math/colors';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import LoginButton from './login-button';

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
                <LoginButton />
            </MemoryRouter>,
            {
                contentConfig: dummyConfigurableContent,
            }
        );

        const LoginButtonEl = document.querySelector(`[data-testid="login-button"]`);

        const style = window.getComputedStyle(LoginButtonEl);

        expect(style.backgroundColor).toBe(expectedColor);
    });
});
