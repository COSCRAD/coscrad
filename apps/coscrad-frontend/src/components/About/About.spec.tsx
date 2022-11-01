import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/getDummyConfigurableContent';

import { About } from './About';

describe('About', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<About />);
        expect(baseElement).toBeTruthy();
    });

    it('should load configurable content', () => {
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
