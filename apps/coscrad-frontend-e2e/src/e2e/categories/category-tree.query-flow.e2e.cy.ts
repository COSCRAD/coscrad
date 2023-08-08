describe('Categories Tree (Tree of Knowledge) flow', () => {
    const pageLabel = 'Tree of Knowledge';

    const dummyCompositeIdPrefix = 'category/9b1deb4d-3b7d-4bad-9bdd-2b0d7b11000';

    const rootNodeCompositeIdentifier = `${dummyCompositeIdPrefix}0`;

    const firstNodeCompositeIdentifier = `${dummyCompositeIdPrefix}1`;

    const treeWalkNodeIds = [1, 2, 5, 7];

    beforeEach(() => {
        cy.visit('/TreeOfKnowledge');
    });

    describe('the tree of knowledge', () => {
        it(`should display the label ${pageLabel}`, () => {
            cy.contains(pageLabel);
        });
    });

    describe('the tree root node', () => {
        it('should open', () => {
            cy.getByDataAttribute(rootNodeCompositeIdentifier).click();
        });
    });

    describe('once the root node is open, the tree', () => {
        it('should display the first sub node with id ', () => {
            cy.getByDataAttribute(rootNodeCompositeIdentifier).click();

            cy.getByDataAttribute(firstNodeCompositeIdentifier);
        });
    });

    // describe('walking the tree category nodes', () => {
    //     it('should find category the tree node with sequence id 7', () => {
    //         cy.getByDataAttribute(rootNodeCompositeIdentifier).click({ multiple: true });

    //         treeWalkNodeIds.forEach((nodeIdSequenceNumber) => {
    //             const { id, type } = buildDummyAggregateCompositeIdentifier(
    //                 AggregateType.category,
    //                 nodeIdSequenceNumber
    //             );

    //             cy.getByDataAttribute(`${type}/${id}`).click({ multiple: true });
    //         });
    //     });
    // });
});
