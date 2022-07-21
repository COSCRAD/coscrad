import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import { DTO } from '../../../../../../types/DTO';
import findRoot from './findRoot';

describe('findRoot', () => {
    describe('when given a valid tree', () => {
        const rootNodeDTO: DTO<Category> = {
            id: '1',
            label: 'root',
            childrenIDs: ['2', '3', '8'],
            members: [],
        };

        const validTree: Category[] = [
            {
                id: '2',
                label: 'plants',
                childrenIDs: ['4', '5'],
            },
            {
                id: '3',
                label: 'animals',
                childrenIDs: ['6', '7'],
            },
            {
                id: '8',
                label: 'bacteria',
                childrenIDs: [],
            },
            {
                id: '4',
                label: 'trees',
                childrenIDs: [],
            },
            {
                id: '5',
                label: 'veggies',
                childrenIDs: [],
            },
            {
                id: '6',
                label: 'mammals',
                childrenIDs: [],
            },
            {
                id: '7',
                label: 'reptiles',
                childrenIDs: [],
            },
        ]
            .map((partialDTO) => ({
                ...partialDTO,
                members: [],
            }))
            .concat(rootNodeDTO)
            .map((dto) => new Category(dto));
        it('should find the root', () => {
            const result = findRoot(validTree);

            expect(result).toEqual(new Category(rootNodeDTO));
        });
    });
});
