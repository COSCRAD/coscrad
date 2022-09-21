import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Videos from './VideoIndex';

describe('Videos', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <Videos />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
