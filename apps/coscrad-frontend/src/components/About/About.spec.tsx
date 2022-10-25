import { renderWithProviders } from '../../utils/test-utils';

import About from './About';

describe('About', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<About />);
        expect(baseElement).toBeTruthy();
    });
});
