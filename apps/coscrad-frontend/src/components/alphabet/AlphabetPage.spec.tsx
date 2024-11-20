import { screen } from '@testing-library/react';

describe('Alphabet', () => {
    it('should load the Alphabet page', () => {
        const screenRes = screen.queryByTestId('Alphabet');

        expect(screenRes).toBeTruthy();
    });
});
