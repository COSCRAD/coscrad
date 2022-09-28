import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SongIndex from './SongIndex';

/**
 * We need to setup tooling to intercept network requests.
 */
describe.skip('SongIndex', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <SongIndex />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
