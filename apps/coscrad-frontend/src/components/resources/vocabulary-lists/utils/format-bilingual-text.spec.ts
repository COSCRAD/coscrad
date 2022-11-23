import { formatBilingualText } from './format-bilingual-text';

const assertExpectedResult = (
    expectedResult: string,
    primaryText: string,
    secondaryText: string
): void => {
    const result = formatBilingualText(primaryText, secondaryText);

    expect(result).toBe(expectedResult);
};

describe('formatBilingualText', () => {
    describe('When there is primary and secondary text', () => {
        it('should return the expected result', () => {
            const primaryText = 'Title';

            const secondaryText = 'Subtitle';

            const expectedResult = 'Title (Subtitle)';

            assertExpectedResult(expectedResult, primaryText, secondaryText);
        });
    });

    describe('When there is only primary text', () => {
        it('should return only the primary text', () => {
            const primaryText = 'Hello World';

            assertExpectedResult(primaryText, primaryText, undefined);
        });
    });

    describe('When there is primary text and secondary text is an empty string', () => {
        it('should return only the primary text', () => {
            const primaryText = 'Hello World';

            assertExpectedResult(primaryText, primaryText, '');
        });
    });

    describe('When there is only secondary text', () => {
        it('should return only the secondary text', () => {
            const secondaryText = 'Hello World';

            assertExpectedResult(secondaryText, undefined, secondaryText);
        });
    });

    describe('When there is only secondary text and primary text is an empty string', () => {
        it('should return only the secondary text', () => {
            const secondaryText = 'Hello World';

            assertExpectedResult(secondaryText, '', secondaryText);
        });
    });

    describe('When both text values are empty strings', () => {
        it('should return an empty string', () => {
            const primaryText = '';

            const secondaryText = '';

            assertExpectedResult('', primaryText, secondaryText);
        });
    });
});
