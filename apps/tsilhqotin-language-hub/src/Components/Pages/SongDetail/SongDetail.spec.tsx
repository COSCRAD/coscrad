import { render } from '@testing-library/react';

import SongIndex from './SongDetail';

describe('SongIndex', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<SongIndex />);
        expect(baseElement).toBeTruthy();
    });
});
