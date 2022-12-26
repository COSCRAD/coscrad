import { buildAuthenticationHeaders, RequestHeaders } from './build-authentication-headers';

const assertActionProducesCorrectResult =
    <T, U>(act: (i: T) => U) =>
    (input: T, expectedResult: U) => {
        const result = act(input);

        expect(result).toEqual(expectedResult);
    };

const assertResult = assertActionProducesCorrectResult((input: string) =>
    buildAuthenticationHeaders(input)
);

const should = 'it should produce the expected result';

describe('buildAuthenticationHeaders', () => {
    const plainHeaders: RequestHeaders = {
        'content-type': 'application/json',
    };
    describe('when the input is null', () => {
        it(should, () => {
            assertResult(null, plainHeaders);
        });
    });

    describe('when the input is undefined', () => {
        it(should, () => {
            assertResult(undefined, plainHeaders);
        });
    });

    describe('when a token is provided', () => {
        const dummyToken = 'ABCDEFU1234569';

        const fullHeaders: RequestHeaders = {
            ...plainHeaders,
            Authorization: `Bearer ABCDEFU1234569`,
        };

        it(should, () => {
            assertResult(dummyToken, fullHeaders);
        });
    });
});
