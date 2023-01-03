import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { Footer } from './Footer';

describe('Footer', () => {
    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const copyrightHolder = 'Copy Right Holder';
        const myConfigurableContent = { ...dummyConfigurableContent, copyrightHolder };

        renderWithProviders(<Footer />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(copyrightHolder);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
