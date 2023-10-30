import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import { AggregateType } from '../../../../../../domain/types/AggregateType';
import { DTO } from '../../../../../../types/DTO';
import findRoot from './findRoot';

describe('findRoot', () => {
    describe('when given a valid tree', () => {
        const rootNodeDTO: DTO<Category> = {
            type: AggregateType.category,
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
            .map((dto) => new Category({ ...dto, type: AggregateType.category }));
        it('should find the root', () => {
            const result = findRoot(validTree);

            expect(result.toDTO()).toEqual(new Category(rootNodeDTO).toDTO());
        });
    });
});
