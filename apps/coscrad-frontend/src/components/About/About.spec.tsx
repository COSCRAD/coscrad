import { render } from '@testing-library/react';
import { getDummyConfigurableContent } from '../../app/App.spec';

import About from './About';

describe('About', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<About frontMatter={getDummyConfigurableContent()} />);
        expect(baseElement).toBeTruthy();
    });
});
