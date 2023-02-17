import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { Header } from './header';

describe('Header', () => {
    const dummyConfigurableContent = getDummyConfigurableContent();

    it('should load the siteTitle from configurable content', () => {
        const siteTitle = 'The New Website Title';
        const myConfigurableContent = { ...dummyConfigurableContent, siteTitle };

        renderWithProviders(
            <MemoryRouter>
                <Header />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const searchPattern = new RegExp(siteTitle);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
