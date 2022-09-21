import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SongIndex from './SongDetail';

describe('SongIndex', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <SongIndex />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
