import {
    DropboxOrCheckbox,
    ITermViewModel,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getConfig } from '../../../config';
import {
    assertElementWithTestIdOnScreen,
    assertNotFound,
    renderWithProviders,
} from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { VocabularyListDetailContainer } from './vocabulary-list-detail.container';

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

const idToFind = '345';

const dummyVocabularyList: IVocabularyListViewModel = {
    id: idToFind,
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
};

const dummyVocabularyLists: IVocabularyListViewModel[] = [dummyVocabularyList];

const endpoint = `${getConfig().apiUrl}/resources/vocabularyLists`;

const act = (idInLocation: string) =>
    renderWithProviders(
        <MemoryRouter initialEntries={[`/Resources/VocabularyLists/${idInLocation}`]}>
            <Routes>
                <Route
                    path={`Resources/VocabularyLists/:id`}
                    element={<VocabularyListDetailContainer />}
                />
            </Routes>
        </MemoryRouter>
    );

describe('vocabulary list detail', () => {
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
        describe('when the ID in the route matches an existing vocabulary list', () => {
            it('should display the vocabulary list', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when the ID in the route does not match any existing vocabulary list', () => {
            it('should render Not Found', async () => {
                act('bogus-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request is invalid or pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
