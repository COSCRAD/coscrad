import { screen, waitFor } from '@testing-library/react';
import { getDummyConfigurableContent } from '../../app/App.spec';
import { renderWithProviders } from '../../utils/test-utils';

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

        waitFor(() => expect(screen.getByText(about)).toBeTruthy());
    });
});
