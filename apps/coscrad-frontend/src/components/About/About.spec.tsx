import { screen } from '@testing-library/react';
import { getDummyConfigurableContent } from '../../app/App.spec';
import { renderWithProviders } from '../../utils/test-utils';

import { About } from './About';

describe('About', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<About />);
        expect(baseElement).toBeTruthy();
    });

    it('should load configurable content', async () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const about = 'About my website';
        const myConfigurableContent = { ...dummyConfigurableContent, about };

        const { baseElement } = renderWithProviders(<About />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(about);
        const screenRes = screen.getByText(searchPattern);
        expect(screenRes).toBeTruthy();
    });
});
