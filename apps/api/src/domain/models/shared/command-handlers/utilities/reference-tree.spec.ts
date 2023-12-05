import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ReferenceTree } from './reference-tree';

describe(`ReferenceTree`, () => {
    describe(`when adding one reference`, () => {
        const type = 'widget';

        const idToFind = buildDummyUuid(123);

        const tree = new ReferenceTree().append(type, idToFind);

        describe(`when the tree has the reference`, () => {
            it(`should return true`, () => {
                expect(tree.has(type, idToFind)).toBe(true);
            });
        });

        describe(`when the tree does not have the reference`, () => {
            describe(`when it has the type, but not ID`, () => {
                it(`should return false`, () => {
                    expect(tree.has(type, 'bogus-123')).toBe(false);
                });
            });

            describe(`when it doesn't have the type`, () => {
                expect(tree.has('bogus-type', idToFind)).toBe(false);
            });
        });
    });

    describe(`when adding several references`, () => {
        const type = 'widget';

        const idstoFind = [11, 20, 456].map(buildDummyUuid);

        const tree = new ReferenceTree().append(type, idstoFind);

        idstoFind.forEach((idToFind) => {
            describe(`when the tree has the reference`, () => {
                it(`should return true`, () => {
                    expect(tree.has(type, idToFind)).toBe(true);
                });
            });

            describe(`when the tree does not have the reference`, () => {
                describe(`when it has the type, but not ID`, () => {
                    it(`should return false`, () => {
                        expect(tree.has(type, 'bogus-123')).toBe(false);
                    });
                });

                describe(`when it doesn't have the type`, () => {
                    expect(tree.has('bogus-type', idToFind)).toBe(false);
                });
            });
        });
    });
});
