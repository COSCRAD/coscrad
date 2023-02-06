import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';

import { Credits } from './credits';

describe('Credits', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<Credits />);
        expect(baseElement).toBeTruthy();
    });

    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const siteCredits = 'Website credits';
        const myConfigurableContent = { ...dummyConfigurableContent, siteCredits };

        renderWithProviders(<Credits />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(siteCredits);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
