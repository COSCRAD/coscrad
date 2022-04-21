import { render } from '@testing-library/react';

import Funders from './Funders';

describe('Funders', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Funders />);
        expect(baseElement).toBeTruthy();
    });
});
