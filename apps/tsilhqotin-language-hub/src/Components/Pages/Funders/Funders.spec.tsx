import { render } from '@testing-library/react';

import { FundersContainer } from './Funders.container';

/**
 * We need a config provider so we can inject a dummy config for tests.
 */
describe.skip('Funders', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<FundersContainer />);
        expect(baseElement).toBeTruthy();
    });
});
