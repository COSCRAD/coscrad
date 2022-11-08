import { IBookPage, IBookViewModel } from '@coscrad/api-interfaces';

const buildDummyPage = (pageId: string): IBookPage => ({
    identifier: pageId,
    text: `This is the text for page: ${pageId}`,
    translation: `This is the translation for page: ${pageId}`,
});

const buildDummyPages = (maxIndex: number): IBookPage[] =>
    Array(maxIndex)
        .fill('')
        .map((_, index) => buildDummyPage(index.toString()));

export const buildDummyBooks = (): IBookViewModel[] => [
    {
        id: '123',
        author: 'Arthur Rattington',
        title: 'The Rat',
        subtitle: 'How he got into the soup...',
        pages: buildDummyPages(8),
    },
    {
        id: '4345',
        author: 'Sue Bird',
        title: 'Fly like an Eagle',
        subtitle: 'Into the Sea',
        pages: buildDummyPages(12),
    },
];
