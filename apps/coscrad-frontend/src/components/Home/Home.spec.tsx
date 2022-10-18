import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getDummyConfigurableContent } from '../../app/App.spec';
import { store } from '../../store';

import Home from './Home';

describe('Home', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <Home {...getDummyConfigurableContent()} />
                </Provider>
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
