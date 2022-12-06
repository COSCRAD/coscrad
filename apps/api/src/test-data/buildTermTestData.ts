import { Term } from '../domain/models/term/entities/term.entity';
import { ResourceType } from '../domain/types/ResourceType';

export const buildTermsForVocabularyList = (): Term[] =>
    [
        {
            id: '11',
            term: 'I am singing (lang)',
            termEnglish: 'I am singing (Engl)',
            contributorId: 'Sarah Smith',
        },

        {
            id: '12',
            term: 'You are singing (lang)',
            termEnglish: 'You are singing (Engl)',
            contributorId: 'Sarah Smith',
        },

        {
            id: '13',
            term: 'She is singing (lang)',
            termEnglish: 'She is singing (Engl)',
            contributorId: 'Sarah Smith',
        },

        {
            id: '01',
            term: 'I am not singing (lang)',
            termEnglish: 'I am not singing (Engl)',
            contributorId: 'Sarah Smith',
        },

        {
            id: '02',
            term: 'You are not singing (lang)',
            termEnglish: 'You are not singing (Engl)',
            contributorId: 'Sarah Smith',
        },

        // Missing entry to check partial filtering behaviour
        // {
        //     id: '03',
        //     term: 'She is not singing (lang)',
        //     termEnglish: 'She is not singing (Engl)',
        //     contributorId: 'Sarah Smith',
        // },
    ]
        .map((partialDto) => ({
            ...partialDto,
            published: true,
            type: ResourceType.term,
        }))
        .map((dto) => new Term(dto));

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Term[] =>
    [
        ...buildTermsForVocabularyList(),
        {
            term: 'Chil-term-1',
            termEnglish: 'Engl-term-1',
            contributorId: 'John Doe',
            id: '1',
            published: true,
        },
        {
            term: 'Chil-term-2',
            termEnglish: 'Engl-term-2',
            contributorId: 'John Doe',
            id: '2',
            published: true,
        },
        {
            term: 'Chil-term-no-english',
            contributorId: 'Jane Deer',
            id: '3',
            published: false,
        },
    ].map((dto) => new Term({ ...dto, type: ResourceType.term }));
