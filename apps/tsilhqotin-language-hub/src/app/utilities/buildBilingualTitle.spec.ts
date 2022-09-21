import buildBilingualTitle from './buildBilingualTitle';

describe('buildBilingualTitle', () => {
    describe('when title and titleEnglish are defined', () => {
        it('should return the expected result', () => {
            const title = 'Chilcotin title';
            const titleEnglish = 'English title';
            const result = buildBilingualTitle(title, titleEnglish);
            const expectedResult = 'Chilcotin title (English title)';
            expect(result).toBe(expectedResult);
        });
    });

    describe('when title and titleEnglish are undefined', () => {
        it('should return undefined', () => {
            const title = undefined;
            const titleEnglish = undefined;
            const expectedResult = undefined;

            const result = buildBilingualTitle(title, titleEnglish);

            expect(result).toBe(expectedResult);
        });
    });

    describe('when only title is defined', () => {
        it('should return title alone', () => {
            const title = 'Chilcotin title';
            const titleEnglish = undefined;
            const expectedResult = 'Chilcotin title';

            const result = buildBilingualTitle(title, titleEnglish);

            expect(result).toBe(expectedResult);
        });
    });

    describe('when only titleEnglish is defined', () => {
        it('should return titleEnglish alone', () => {
            const title = undefined;
            const titleEnglish = 'English title';
            const expectedResult = 'English title';

            const result = buildBilingualTitle(title, titleEnglish);

            expect(result).toBe(expectedResult);
        });
    });
});
