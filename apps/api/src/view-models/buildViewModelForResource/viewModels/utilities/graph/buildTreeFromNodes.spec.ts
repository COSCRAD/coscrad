import buildTestData from '../../../../../test-data/buildTestData';
import buildTreeFromNodes from './buildTreeFromNodes';

describe('buildTreeFromNodes', () => {
    describe('when given a valid tree', () => {
        const validTree = buildTestData().categoryTree;

        it('should return the expected result', () => {
            const result = buildTreeFromNodes(validTree);

            expect(result).toMatchSnapshot();
        });
    });
});
