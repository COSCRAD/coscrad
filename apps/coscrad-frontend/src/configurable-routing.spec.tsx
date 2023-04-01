import { screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './app/create-app-router';
import { renderWithProviders } from './utils/test-utils';
import { getDummyConfigurableContent } from './utils/test-utils/get-dummy-configurable-content';

const dummyContentConfig = getDummyConfigurableContent();

describe('custom configured routing', () => {
    describe('required routes', () => {
        describe('when the route does not exit', () => {
            it('should render an error message', () => {
                renderWithProviders(
                    <RouterProvider router={createAppRouter(dummyContentConfig)} />,
                    { contentConfig: dummyContentConfig }
                );
            });
        });
        describe('Resources', () => {
            it('should have a menu item', () => {
                const config = {
                    ...dummyContentConfig,
                };

                renderWithProviders(<RouterProvider router={createAppRouter(config)} />, {
                    contentConfig: config,
                });

                const menu = screen.getByTestId('nav-menu');

                expect(menu.innerText.includes('Resources'));
            });
        });
    });
});
