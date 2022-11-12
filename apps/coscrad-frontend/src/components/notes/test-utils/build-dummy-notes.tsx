import { EdgeConnectionMemberRole, INoteViewModel } from '@coscrad/api-interfaces';

export const buildDummyNotes = (): INoteViewModel[] => [
    {
        id: '55',
        note: 'This is the best part of the book',
        relatedResources: [
            {
                compositeIdentifier: {
                    type: 'book',
                    id: '1',
                },
                role: EdgeConnectionMemberRole.to,
                context: {
                    type: 'pageRange',
                    // TODO deal with specific context types
                    // pageIdentifiers: ['33','34','35','36']
                },
            },
        ],
    },
    {
        id: '59',
        note: 'This is the part of the book depicted in the video here',
        relatedResources: [
            {
                compositeIdentifier: {
                    type: 'book',
                    id: '1',
                },
                role: EdgeConnectionMemberRole.to,
                context: {
                    type: 'pageRange',
                    // TODO deal with specific context types
                    // pageIdentifiers: ['33','34','35','36']
                },
            },
            {
                compositeIdentifier: {
                    type: 'video',
                    id: '44',
                },
                role: EdgeConnectionMemberRole.from,
                context: {
                    type: 'timeRange',
                    // tODO deal with specific context types
                },
            },
        ],
    },
];
