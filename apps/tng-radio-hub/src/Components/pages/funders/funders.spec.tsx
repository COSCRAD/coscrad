import { render } from '@testing-library/react';

import Funders from './funders';

describe('Funders', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Funders />);
        expect(baseElement).toBeTruthy();
    });
});
