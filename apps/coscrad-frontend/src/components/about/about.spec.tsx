import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';

import { About } from './about';

describe('About', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<About />);
        expect(baseElement).toBeTruthy();
    });

    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const about = 'About my website';
        const myConfigurableContent = { ...dummyConfigurableContent, about };

        renderWithProviders(<About />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(about);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
