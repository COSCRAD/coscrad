import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '../store';
import App from './App';

import ConfigurableContent from '../configurable-front-matter/ConfigurableContent';

const dummyConfigurableContent: ConfigurableContent = {
    siteTitle: 'My Site',

    subTitle: 'Where it all Happens',

    about: 'Just a Test',

    siteDescription: 'This is my testing site',

    copyrightHolder: 'ME',
};

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <App content={dummyConfigurableContent} />
                </Provider>
            </MemoryRouter>
        );

        expect(baseElement).toBeTruthy();
    });
});
