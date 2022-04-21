import { render } from '@testing-library/react';

import Greetings from './Greetings';

describe('Greetings', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Greetings />);
        expect(baseElement).toBeTruthy();
    });
});
