import { screen } from '@testing-library/react';

import { CoscradThemeProvider } from './coscrad-theme-provider';
import { renderWithProviders } from './utils/test-utils';
import { getDummyConfigurableContent } from './utils/test-utils/get-dummy-configurable-content';

describe('CoscradThemeProvider', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<CoscradThemeProvider children={''} />);
        expect(baseElement).toBeTruthy();
    });

    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const CoscradThemeProvider = 'h1';
        const myConfigurableContent = { ...dummyConfigurableContent, CoscradThemeProvider };

        renderWithProviders(<CoscradThemeProvider children={''} />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(CoscradThemeProvider);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
