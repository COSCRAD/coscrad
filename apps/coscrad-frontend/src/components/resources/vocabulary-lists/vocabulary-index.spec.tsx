import {
    DropboxOrCheckbox,
    ITermViewModel,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../../config';
import { assertElementWithTestIdOnScreen, renderWithProviders } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { VocabularyListIndexContainer } from './vocabulary-list-index.container';

const validValues: string[] = ['1', '2'];

const dummyTerms: ITermViewModel[] = [
    {
        id: '1',
        term: 'term 1 (language)',
        audioUrl: 'https://www.mysoundbox.com/foo.mp3',
        contributor: 'John Doe',
    },
    {
        id: '2',
        term: 'term 2 (language)- has no audio',
        termEnglish: 'term 2 (English)',
        contributor: 'Jane Deer',
    },
];

const dummyEntries: IVocabularyListEntry<boolean | string>[] = dummyTerms.map(
    (term, index): IVocabularyListEntry<boolean | string> => ({
        term,
        variableValues: {
            person: validValues[index],
        },
    })
);

const dummyVocabularyLists: IVocabularyListViewModel[] = [
    {
        id: '345',
        name: 'VL name (language)',
        nameEnglish: 'VL name (English)',
        entries: dummyEntries,
        variables: [
            {
                name: 'possessor',
                type: DropboxOrCheckbox.dropbox,
                validValues: validValues.map((value) => ({
                    value,
                    display: value,
                })),
            },
        ],
    },
];

const endpoint = `${getConfig().apiUrl}/resources/vocabularyLists`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <VocabularyListIndexContainer />
        </MemoryRouter>
    );

describe('Vocabulary List Index', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyVocabularyLists.map((item) => [item, []]),
                    []
                ),
            })
        );

        it('should display the vocabulary lists', async () => {
            act();

            await assertElementWithTestIdOnScreen(dummyVocabularyLists[0].id);
        });
    });

    describe('when the API request is invalid or in progress', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
