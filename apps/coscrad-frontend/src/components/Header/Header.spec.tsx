import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { Header } from './Header';

describe('Header', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
