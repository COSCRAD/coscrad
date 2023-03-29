import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';

import { NotFoundPresenter } from './not-found-presenter';

describe('About', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<NotFoundPresenter />);
        expect(baseElement).toBeTruthy();
    });

    it('should load configurable content', () => {
        const dummyConfigurableContent = getDummyConfigurableContent();
        const notFoundMessage = 'Not found';
        const myConfigurableContent = { ...dummyConfigurableContent, notFoundMessage };

        renderWithProviders(<NotFoundPresenter />, {
            contentConfig: myConfigurableContent,
        });

        const searchPattern = new RegExp(notFoundMessage);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });
});
