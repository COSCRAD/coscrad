import { CategorizedTree } from '../domain/models/categories/types/CategorizedTree';
import { noteType } from '../domain/models/categories/types/ResourceTypeOrNoteType';
import { resourceTypes } from '../domain/types/resourceTypes';

export default (): CategorizedTree => [
    {
        id: '1',
        label: 'animals',
        members: [
            {
                type: resourceTypes.vocabularyList,
                id: '1',
            },
        ],
        children: ['2', '3'],
    },
    {
        id: '2',
        label: 'mammals',
        members: [
            {
                type: resourceTypes.term,
                id: '1',
            },
            {
                type: resourceTypes.book,
                id: '23',
            },
        ],
        children: ['4', '5', '11'],
    },
    {
        id: '3',
        label: 'birds',
        members: [],
        children: [],
    },
    {
        id: '4',
        label: 'canines',
        members: [
            {
                type: resourceTypes.term,
                id: '2',
            },
        ],
        children: ['8', '10'],
    },
    {
        id: '5',
        label: 'felines',
        members: [],
        children: ['6', '7'],
    },
    {
        id: '6',
        label: 'big cats',
        members: [],
        children: [],
    },
    {
        id: '7',
        label: 'domestic cats',
        members: [
            {
                type: resourceTypes.vocabularyList,
                id: '2',
            },
            {
                type: resourceTypes.photograph,
                id: '0',
            },
        ],
        children: [],
    },
    {
        id: '8',
        label: 'wolves',
        members: [
            {
                type: resourceTypes.spatialFeature,
                id: '101',
            },
        ],
        children: [],
    },
    {
        id: '9',
        label: 'songs',
        members: [
            {
                type: resourceTypes.term,
                id: '3',
            },
            {
                type: resourceTypes.spatialFeature,
                id: '102',
            },
        ],
        children: [],
    },
    {
        id: '10',
        label: 'domestic dogs',
        members: [
            {
                type: resourceTypes.photograph,
                id: '1',
            },
        ],
        children: [],
    },
    {
        id: '11',
        label: 'rodents',
        members: [
            {
                type: resourceTypes.book,
                id: '24',
            },
        ],
        children: [],
    },
    {
        id: '12',
        label: 'film',
        members: [],
        children: ['13', '14'],
    },
    {
        id: '13',
        label: 'props',
        members: [],
        children: ['16', '17', '18'],
    },
    {
        id: '14',
        label: 'wardrobe',
        members: [],
        children: [],
    },
    {
        id: '15',
        label: 'tools',
        members: [
            {
                type: resourceTypes.transcribedAudio,
                id: '110',
            },
        ],
        children: [],
    },
    {
        id: '16',
        label: 'adornments',
        members: [],
        children: ['15'],
    },
    {
        id: '17',
        label: 'clothing',
        members: [
            {
                type: noteType,
                id: '1',
            },
        ],
        children: [],
    },
    {
        id: '18',
        // Duplicate label ok, but not duplicate ID
        label: 'tools',
        members: [],
        children: [],
    },
];
