import { VocabularyList } from '../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { DropboxOrCheckbox } from '../domain/models/vocabulary-list/types/dropbox-or-checkbox';
import { ResourceType } from '../domain/types/ResourceType';

const vocabularyListDTOs = [
    // Vocabulary List 1
    {
        id: '1',
        name: 'test VL 1 chil',
        nameEnglish: 'test VL 1 engl',
        published: false,
        entries: [
            {
                termId: '1',
                variableValues: {
                    person: '11',
                },
            },
            {
                termId: '2',
                variableValues: {
                    person: '21',
                },
            },
        ],
        variables: [
            {
                name: 'person',
                type: 'dropbox' as DropboxOrCheckbox,
                validValues: [
                    {
                        display: 'I',
                        value: '11',
                    },
                    {
                        display: 'We',
                        value: '21',
                    },
                ],
            },
        ],
    },
    // Vocabulary List 2
    {
        id: '2',
        name: 'test VL 2 CHIL- no engl name',
        published: true,
        entries: [
            {
                termId: '2',
                variableValues: {
                    person: '23',
                },
            },
        ],
        variables: [],
    },
];

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): VocabularyList[] =>
    vocabularyListDTOs.map(
        (dto) => new VocabularyList({ ...dto, type: ResourceType.vocabularyList })
    );
