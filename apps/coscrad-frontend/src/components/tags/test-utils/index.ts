import { ITagViewModel } from '@coscrad/api-interfaces';

export const buildDummyTags = (): ITagViewModel[] => [
    {
        label: 'birds',
        id: '201',
        // TODO Add members
        members: [],
    },
    {
        label: 'reptiles',
        id: '202',
        members: [],
    },
];
