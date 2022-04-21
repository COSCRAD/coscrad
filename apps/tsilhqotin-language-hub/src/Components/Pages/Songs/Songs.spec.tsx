import { render } from '@testing-library/react';

import Songs from './Songs';

describe('Songs', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Songs />);
        expect(baseElement).toBeTruthy();
    });
});
