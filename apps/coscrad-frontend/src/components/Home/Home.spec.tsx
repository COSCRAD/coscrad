import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import FrontMatter from '../../app/configurable-front-matter/frontMatterData/FrontMatter';
import getFrontMatter from '../../app/configurable-front-matter/getFrontMatter';
import { store } from '../../store';

import Home from './Home';

const frontMatterReadResult = getFrontMatter();

describe('Home', () => {
    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <Provider store={store}>
                    <Home frontMatter={frontMatterReadResult as FrontMatter} />
                </Provider>
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
