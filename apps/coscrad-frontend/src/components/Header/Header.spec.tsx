import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getDummyConfigurableContent } from '../../app/App.spec';
import { renderWithProviders } from '../../utils/test-utils';
import { Header } from './Header';

describe('Header', () => {
    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const siteTitle = 'The New Website Title';
        const subTitle = 'The New Website Subtitle';
        const myConfigurableContent = { ...dummyConfigurableContent, siteTitle, subTitle };

        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <Header />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const searchPattern = new RegExp(siteTitle);
        const screenRes1 = screen.getByText(searchPattern);
        const searchPattern2 = new RegExp(subTitle);
        const screenRes2 = screen.getByText(searchPattern2);
        const screenRes = screenRes1 && screenRes2 ? true : false;
        expect(screenRes).toBeTruthy();
    });
});
