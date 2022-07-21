import { render } from '@testing-library/react';

import Stream from './stream';

describe('Stream', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Stream />);
        expect(baseElement).toBeTruthy();
    });
});
