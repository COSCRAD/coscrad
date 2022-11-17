import { ITermViewModel } from '../../../../../../../libs/api-interfaces/src';

export const buildDummyTerms = (): ITermViewModel[] => [
    {
        id: '1',
        term: 'term 1 in language',
        termEnglish: 'term 1 translated to English',
        contributor: 'Bob Sith',
    },
    {
        id: '2',
        term: 'term 2 in language (no translation)',
        contributor: 'Barb James',
    },
    {
        id: '3',
        termEnglish: 'term 3 English (no language entry)',
        contributor: 'Ronald McDonnald',
    },
];
