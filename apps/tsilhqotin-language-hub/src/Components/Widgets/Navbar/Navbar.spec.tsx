import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
