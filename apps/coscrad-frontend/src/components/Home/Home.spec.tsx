import { MemoryRouter } from 'react-router-dom';
import { getDummyConfigurableContent } from '../../app/App.spec';
import { renderWithProviders } from '../../utils/test-utils/renderWithProviders';

import Home from './Home';

describe('Home', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <Home {...getDummyConfigurableContent()} />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
