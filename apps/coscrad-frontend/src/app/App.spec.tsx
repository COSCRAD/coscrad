import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../utils/test-utils/renderWithProviders';
import App from './App';

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
