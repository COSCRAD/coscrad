import { render } from '@testing-library/react';

import Teachers from './Teachers';

describe('Teachers', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Teachers />);
        expect(baseElement).toBeTruthy();
    });
});
