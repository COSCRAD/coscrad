import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { Footer } from './footer';

describe('Footer', () => {
    const dummyConfigurableContent = getDummyConfigurableContent();

    it('should load configurable content', () => {
        const copyrightHolder = 'Copy Right Holder';
        const myConfigurableContent = { ...dummyConfigurableContent, copyrightHolder };

        renderWithProviders(<Footer />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(copyrightHolder);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });

    it('should load the subTitle from configurable content', () => {
        const subTitle = 'The New Website Subtitle';
        const myConfigurableContent = { ...dummyConfigurableContent, subTitle };

        renderWithProviders(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const searchPattern = new RegExp(subTitle);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
