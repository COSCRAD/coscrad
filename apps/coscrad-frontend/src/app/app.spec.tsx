import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../utils/test-utils/render-with-providers';
import App from './app';

/**
 * We need to polyfill \ stub \ mock `EventSource`. Realistically, `Cypress`
 * `e2e` tests will provide us with a smoke test that everything renders up-front.
 */
describe.skip('App', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        expect(baseElement).toBeTruthy();
    });
});
