import { render } from '@testing-library/react';

import TermsDetail from './TermsDetail';

describe('TermsDetail', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TermsDetail />);
    expect(baseElement).toBeTruthy();
  });
});
