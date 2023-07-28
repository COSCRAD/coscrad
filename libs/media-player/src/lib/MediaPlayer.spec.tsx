import { render } from '@testing-library/react';

import MediaPlayer from './audio-player';

describe('MediaPlayer', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<MediaPlayer />);
        expect(baseElement).toBeTruthy();
    });
});
