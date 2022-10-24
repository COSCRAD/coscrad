import { screen, waitFor } from '@testing-library/react';

export const assertElementWithTestIdOnScreen = (testId: string) =>
    waitFor(() => expect(screen.getByTestId(testId)).toBeTruthy());
