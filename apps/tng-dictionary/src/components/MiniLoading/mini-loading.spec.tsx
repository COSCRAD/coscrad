import { render } from '@testing-library/react';

import MiniLoading from './mini-loading';

describe('MiniLoading', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MiniLoading />);
    expect(baseElement).toBeTruthy();
  });
});
