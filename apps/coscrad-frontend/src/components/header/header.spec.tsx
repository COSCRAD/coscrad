import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { hexToRgb } from '../../utils/math/colors';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { Header } from './header';

describe('Header', () => {
    it('should load the siteTitle from configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();

        const siteTitle = 'The New Website Title';
        const myConfigurableContent = { ...dummyConfigurableContent, siteTitle };

        renderWithProviders(
            <MemoryRouter>
                <Header />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const searchPattern = new RegExp(siteTitle);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
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
                <Header />
            </MemoryRouter>,
            {
                contentConfig: dummyConfigurableContent,
            }
        );

        const headerEl = document.querySelector(`[data-testid="app-bar"]`);

        const style = window.getComputedStyle(headerEl);

        expect(style.backgroundColor).toBe(expectedColor);
    });
});
