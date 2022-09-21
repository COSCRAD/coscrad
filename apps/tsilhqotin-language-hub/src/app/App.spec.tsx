import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<App />);

        expect(baseElement).toBeTruthy();
    });

    it('should include our tagline', () => {
        const { getByText } = render(<App />);

        expect(getByText(/We’re speaking the Tŝilhqot’in language/gi)).toBeTruthy();
    });
});
