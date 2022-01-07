import { render } from '@testing-library/react';

import Credits from './Credits';

describe('Credits', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Credits />);
    expect(baseElement).toBeTruthy();
  });
});
