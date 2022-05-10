import { Tag } from '../domain/models/tag/tag.entity';
import { DTO } from '../types/DTO';

const allTagsDTOs: DTO<Tag>[] = [
    {
        id: '1',
        label: 'plants',
        members: [],
    },
    {
        id: '2',
        label: 'animals',
        members: [],
    },
    {
        id: '3',
        label: 'placenames',
        members: [],
    },
    {
        id: '4',
        label: 'songs',
        members: [],
    },
    {
        id: '5',
        label: 'legends',
        members: [],
    },
];

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Tag[] => allTagsDTOs.map((dto) => new Tag(dto));
