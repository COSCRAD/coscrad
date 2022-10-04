import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AllResources } from './AllResources';

const mockResponse = {
    term: 'term description',
    vocabularyList:
        'A vocabulary list gathers terms with filters that apply within the context of the vocabulary list',
    tag: 'A tag is a classifier for an entity or a pair of related entities',
};

// TODO unskip this test
describe.skip('AllEntities', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockResponse),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render successfully', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <AllResources />
            </MemoryRouter>
        );
        expect(baseElement).toBeTruthy();
    });
});
