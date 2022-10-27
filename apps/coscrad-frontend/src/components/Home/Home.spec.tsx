import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils/renderWithProviders';

import { Home } from './Home';

describe('Home', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
