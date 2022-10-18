import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import App from './App';

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <App />
                </Provider>
            </MemoryRouter>
        );

        expect(baseElement).toBeTruthy();
    });
});
