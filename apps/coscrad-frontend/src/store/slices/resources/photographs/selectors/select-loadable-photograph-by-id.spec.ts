import {
    HttpStatusCode,
    IDetailQueryResult,
    IHttpErrorInfo,
    IIndexQueryResult,
    IPhotographViewModel,
} from '@coscrad/api-interfaces';
import { RootState } from '../../../..';
import { buildMockIndexResponse } from '../../../../../utils/test-utils/test-data';
import { IMaybeLoadable, NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';
import { buildInitialLoadableState } from '../../../utils';
import { PhotographSliceState } from '../types';
import { selectLoadablePhotographById } from './select-loadable-photograph-by-id';

const initialState = buildInitialLoadableState<IIndexQueryResult<IPhotographViewModel>>();

const buildState = (overrides: Partial<PhotographSliceState>) => ({
    photographs: {
        ...initialState,
        ...overrides,
    },
});

const idThatExists = '123';

const photographToFind = {
    id: idThatExists,
    photographer: 'Bobbo Robbo',
    imageURL: 'https://goodpix.com/123.bmp',
};

const allPhotographs: IPhotographViewModel[] = [photographToFind];

const foundData: IDetailQueryResult<IPhotographViewModel> = {
    data: photographToFind,
    actions: [],
};

const indexQueryResult = buildMockIndexResponse(
    allPhotographs.map((photo) => [photo, []]),
    []
);

type TestCase = {
    description: string;
    initialState: Pick<RootState, 'photographs'>;
    idToFind: string;
    expectedResult: IMaybeLoadable<IDetailQueryResult<IPhotographViewModel>>;
};

const dummyErrorInfo: IHttpErrorInfo = {
    code: HttpStatusCode.badRequest,
    message: 'bad user request',
};

const testCases: TestCase[] = [
    {
        initialState: buildState({ isLoading: true, data: null }),
        idToFind: idThatExists,
        expectedResult: {
            isLoading: true,
            errorInfo: null,
            data: null,
        },
        description: 'when the data is loading',
    },
    {
        initialState: buildState({
            errorInfo: dummyErrorInfo,
        }),
        idToFind: idThatExists,
        expectedResult: {
            isLoading: false,
            errorInfo: dummyErrorInfo,
            data: null,
        },
        description: 'when there was an error loading the data',
    },
    {
        initialState: buildState({
            isLoading: false,
            errorInfo: null,
            data: null,
        }),
        idToFind: idThatExists,
        expectedResult: {
            isLoading: false,
            errorInfo: null,
            data: null,
        },
        description: 'when given the initial state',
    },
    {
        initialState: buildState({
            isLoading: false,
            errorInfo: null,
            data: indexQueryResult,
        }),
        idToFind: idThatExists,
        expectedResult: {
            data: foundData,
            errorInfo: null,
            isLoading: false,
        },

        description: 'when the search ID matches one of the existing photographs',
    },
    {
        initialState: buildState({
            isLoading: false,
            errorInfo: null,
            data: indexQueryResult,
        }),
        idToFind: 'bogus-id',
        expectedResult: {
            data: NOT_FOUND,
            errorInfo: null,
            isLoading: false,
        },

        description: 'when the search ID does not match any of the existing photographs',
    },
];

describe(`selectLoadablePhotographById`, () => {
    testCases.forEach(({ initialState, idToFind, expectedResult, description }) =>
        describe(description, () => {
            it('should return the expected result', () => {
                const result = selectLoadablePhotographById(initialState as RootState, idToFind);

                expect(result).toEqual(expectedResult);
            });
        })
    );
});
