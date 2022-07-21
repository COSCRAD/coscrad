import { Tag } from '../domain/models/tag/tag.entity';
import { CategorizableType } from '../domain/types/CategorizableType';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';

const allTagsDTOs: DTO<Tag>[] = [
    {
        id: '1',
        label: 'plants',
        members: [
            {
                type: CategorizableType.term,
                id: '1',
            },
            {
                type: CategorizableType.book,
                id: '23',
            },
            {
                type: CategorizableType.book,
                id: '24',
            },
            {
                type: CategorizableType.vocabularyList,
                id: '1',
            },
            {
                type: CategorizableType.spatialFeature,
                id: '100',
            },
            {
                type: CategorizableType.note,
                id: '2005',
            },
            {
                type: CategorizableType.note,
                id: '9',
            },
            {
                type: CategorizableType.note,
                id: '11',
            },
        ],
    },
    {
        id: '2',
        label: 'animals',
        members: [
            {
                type: CategorizableType.term,
                id: '2',
            },
            {
                type: CategorizableType.term,
                id: '3',
            },
            {
                type: CategorizableType.spatialFeature,
                id: '102',
            },
            {
                type: CategorizableType.note,
                id: '2004',
            },
            {
                type: CategorizableType.note,
                id: '7',
            },
            {
                type: CategorizableType.bibliographicReference,
                id: '1',
            },
        ],
    },
    {
        id: '3',
        label: 'placenames',
        members: [
            {
                type: CategorizableType.photograph,
                id: '0',
            },
            {
                type: CategorizableType.transcribedAudio,
                id: '110',
            },
            {
                type: CategorizableType.note,
                id: '2003',
            },
            {
                type: CategorizableType.note,
                id: '5',
            },
        ],
    },
    {
        id: '4',
        label: 'songs',
        members: [
            {
                type: CategorizableType.photograph,
                id: '1',
            },
            {
                type: CategorizableType.note,
                id: '2002',
            },
            {
                type: CategorizableType.note,
                id: '3',
            },
        ],
    },
    {
        id: '5',
        label: 'legends',
        members: [
            {
                type: CategorizableType.vocabularyList,
                id: '2',
            },
            {
                type: CategorizableType.spatialFeature,
                id: '101',
            },
            {
                type: CategorizableType.note,
                id: '2001',
            },
            {
                type: CategorizableType.note,
                id: '1',
            },
            {
                type: ResourceType.mediaItem,
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
