import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';

import { Credits } from './credits';

describe('About', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<Credits />);
        expect(baseElement).toBeTruthy();
    });

    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const about = 'About my website';
        const myConfigurableContent = { ...dummyConfigurableContent, about };

        renderWithProviders(<Credits />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(about);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
