import { render } from '@testing-library/react';
import getFrontMatter from '../../app/configurable-front-matter/getFrontMatter';

import About from './About';

const frontMatterReadResult = getFrontMatter();

describe('About', () => {
  it('should render successfully', () => {
    if (frontMatterReadResult instanceof Error) return;
    const { baseElement } = render(<About frontMatter={frontMatterReadResult} />);
    expect(baseElement).toBeTruthy();
  });
});
