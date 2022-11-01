import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getDummyConfigurableContent } from '../../utils/test-utils/getDummyConfigurableContent';
import { renderWithProviders } from '../../utils/test-utils/renderWithProviders';

import { Home } from './Home';

describe('Home', () => {
    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const siteDescription = 'Describe my site here';
        const siteHomeImageUrl = 'https://mysite.com/homeimg.png';
        const myConfigurableContent = {
            ...dummyConfigurableContent,
            siteDescription,
            siteHomeImageUrl,
        };

        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const searchPattern = new RegExp(siteDescription);
        const screenRes = screen.getByText(searchPattern);

        const logo = baseElement.querySelector('img');

        // Split into two tests?  Use a helper function for loading the configurable content?
        expect(logo.src).toContain(siteHomeImageUrl);
        expect(screenRes).toBeTruthy();
    });
});
