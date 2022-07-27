import { render } from '@testing-library/react';

import Songs from './SongViewModel';

describe('Songs', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Songs />);
        expect(baseElement).toBeTruthy();
    });
});
