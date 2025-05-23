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

describe('when an email is provided', () => {
    const dummyConfigurableContent = getDummyConfigurableContent();

    it('should render the email address', () => {
        const email = 'johndoe@johndoe.com';
        const myConfigurableContent = { ...dummyConfigurableContent, email };

        renderWithProviders(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const searchPattern = new RegExp(email);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });

    it('should render the email icon', () => {
        const email = 'johndoe@johndoe.com';
        const myConfigurableContent = { ...dummyConfigurableContent, email };

        renderWithProviders(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const screenRes = screen.queryByTestId('email-icon');

        expect(screenRes).toBeTruthy();
    });
});

describe('when an email is not provided', () => {
    const dummyConfigurableContent = getDummyConfigurableContent();

    it('should not render the email icon or email address', () => {
        const email = '';
        const myConfigurableContent = { ...dummyConfigurableContent, email };

        renderWithProviders(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>,
            {
                contentConfig: myConfigurableContent,
            }
        );

        const screenRes = screen.queryByTestId('email-icon');
        const emailText = screen.queryByTestId('email-text');

        expect(screenRes).toBeFalsy();
        expect(emailText).toBeFalsy();
    });
});
