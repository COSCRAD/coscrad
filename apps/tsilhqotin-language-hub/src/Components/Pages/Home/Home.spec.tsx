import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Home from './Home';

describe('Home', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
