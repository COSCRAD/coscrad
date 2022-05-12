import { noteType } from '../domain/models/categories/types/ResourceTypeOrNoteType';
import { Tag } from '../domain/models/tag/tag.entity';
import { resourceTypes } from '../domain/types/resourceTypes';
import { DTO } from '../types/DTO';

const allTagsDTOs: DTO<Tag>[] = [
    {
        id: '1',
        label: 'plants',
        members: [
            {
                type: resourceTypes.term,
                id: '1',
            },
            {
                type: resourceTypes.book,
                id: '23',
            },
            {
                type: resourceTypes.book,
                id: '24',
            },
            {
                type: resourceTypes.vocabularyList,
                id: '1',
            },
            {
                type: resourceTypes.spatialFeature,
                id: '100',
            },
            {
                type: noteType,
                id: '2005',
            },
            {
                type: noteType,
                id: '9',
            },
            {
                type: noteType,
                id: '11',
            },
        ],
    },
    {
        id: '2',
        label: 'animals',
        members: [
            {
                type: resourceTypes.term,
                id: '2',
            },
            {
                type: resourceTypes.term,
                id: '3',
            },
            {
                type: resourceTypes.spatialFeature,
                id: '102',
            },
            {
                type: noteType,
                id: '2004',
            },
            {
                type: noteType,
                id: '7',
            },
        ],
    },
    {
        id: '3',
        label: 'placenames',
        members: [
            {
                type: resourceTypes.photograph,
                id: '0',
            },
            {
                type: resourceTypes.transcribedAudio,
                id: '110',
            },
            {
                type: noteType,
                id: '2003',
            },
            {
                type: noteType,
                id: '5',
            },
        ],
    },
    {
        id: '4',
        label: 'songs',
        members: [
            {
                type: resourceTypes.photograph,
                id: '1',
            },
            {
                type: noteType,
                id: '2002',
            },
            {
                type: noteType,
                id: '3',
            },
        ],
    },
    {
        id: '5',
        label: 'legends',
        members: [
            {
                type: resourceTypes.vocabularyList,
                id: '2',
            },
            {
                type: resourceTypes.spatialFeature,
                id: '101',
            },
            {
                type: noteType,
                id: '2001',
            },
            {
                type: noteType,
                id: '1',
            },
        ],
    },
];

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Tag[] => allTagsDTOs.map((dto) => new Tag(dto));
