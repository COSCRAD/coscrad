import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../utils/test-utils/render-with-providers';
import App from './app';

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        expect(baseElement).toBeTruthy();
    });
});
