import { render } from '@testing-library/react';

import MediaPlayer from './MediaPlayer';

describe('MediaPlayer', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<MediaPlayer />);
        expect(baseElement).toBeTruthy();
    });
});
