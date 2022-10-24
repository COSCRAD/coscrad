import { MemoryRouter } from 'react-router-dom';
import { ConfigurableContent } from '../configurable-front-matter/data/configurableContentSchema';
import { renderWithProviders } from '../utils/test-utils/renderWithProviders';
import App from './App';

export const getDummyConfigurableContent = (): ConfigurableContent => ({
    siteTitle: 'My Site',

    subTitle: 'Where it all Happens',

    about: 'Just a Test',

    siteDescription: 'This is my testing site',

    copyrightHolder: 'ME',
});

describe('App', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <App content={getDummyConfigurableContent()} />
            </MemoryRouter>
        );

        expect(baseElement).toBeTruthy();
    });
});
