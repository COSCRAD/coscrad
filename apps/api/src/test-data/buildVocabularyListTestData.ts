import { Term } from '../domain/models/term/entities/term.entity';
import { VocabularyListVariable } from '../domain/models/vocabulary-list/entities/vocabulary-list-variable.entity';
import { VocabularyList } from '../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { DropboxOrCheckbox } from '../domain/models/vocabulary-list/types/dropbox-or-checkbox';
import { VocabularyListEntry } from '../domain/models/vocabulary-list/vocabulary-list-entry.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import { buildTermsForVocabularyList } from './buildTermTestData';
import {
    convertAggregatesIdToUuid,
    convertSequenceNumberToUuid,
} from './utilities/convertSequentialIdToUuid';

const terms = buildTermsForVocabularyList();

const buildEntryForTerm = (term: Term): VocabularyListEntry => {
    const { id } = term;

    // 1 positive = true, 2 positive = false (negative form)
    const positive = id.slice(-1) === '1';

    // 1 - first person, etc.
    const person = id.slice(-2);

    return new VocabularyListEntry({
        termId: id,
        variableValues: {
            positive,
            person,
        },
    });
};

const entries = terms.map(buildEntryForTerm);

const formFieldForPositive: VocabularyListVariable = {
    name: 'positive',
    type: DropboxOrCheckbox.checkbox,
    validValues: [
        {
            value: false,
            display: 'negative (lha)',
        },
        {
            value: true,
            display: 'positive form (switch for negative)',
        },
    ],
};

const formFieldForPerson: VocabularyListVariable = {
    name: 'person',
    type: DropboxOrCheckbox.dropbox,
    validValues: [
        {
            value: '1',
            display: 'I',
        },
        {
            value: '2',
            display: 'You',
        },
        {
            value: '3',
            display: 'She',
        },
    ],
};

const detailedVocabularyList: DTO<VocabularyList> = {
    id: '4567',
    name: 'To Sing (lang)',
    nameEnglish: 'To Sing (Engl)',
    entries,
    variables: [formFieldForPositive, formFieldForPerson],
    published: true,
    type: ResourceType.vocabularyList,
};

const vocabularyListDTOs = [
    detailedVocabularyList,
    // Vocabulary List 1
    {
        id: '1',
        name: 'test VL 1 chil',
        nameEnglish: 'test VL 1 engl',
        published: true,
        entries: [
            {
                termId: convertSequenceNumberToUuid(1),
                variableValues: {
                    person: '11',
                },
            },
            {
                termId: convertSequenceNumberToUuid(2),
                variableValues: {
                    person: '12',
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
                        value: '12',
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
                termId: convertSequenceNumberToUuid(2),
                variableValues: {
                    his: false,
                },
            },
            {
                termId: convertSequenceNumberToUuid(1),
                variableValues: {
                    his: true,
                },
            },
        ],
        variables: [
            {
                name: 'his',
                type: DropboxOrCheckbox.checkbox,
                validValues: [
                    {
                        display: 'his',
                        value: true,
                    },
                    {
                        display: 'hers',
                        value: false,
                    },
                ],
            },
        ],
    },
];

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): VocabularyList[] =>
    vocabularyListDTOs
        .map((dto) => new VocabularyList({ ...dto, type: ResourceType.vocabularyList }))
        .map(convertAggregatesIdToUuid);
