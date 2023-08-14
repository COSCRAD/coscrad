describe('Categories Tree (Tree of Knowledge) flow', () => {
    const pageLabel = 'Tree of Knowledge';

    const dummyCompositeIdPrefix = 'category/9b1deb4d-3b7d-4bad-9bdd-2b0d7b11000';

    const rootNodeCompositeIdentifier = `${dummyCompositeIdPrefix}0`;

    const firstNodeCompositeIdentifier = `${dummyCompositeIdPrefix}1`;

    const nestedNodeCompositeIdentifier = `${dummyCompositeIdPrefix}7`;

    const accordionTestId = `resources-for-${nestedNodeCompositeIdentifier}`;

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
        beforeEach(() => {
            cy.getByDataAttribute(rootNodeCompositeIdentifier).click();
        });

        it(`should display the first sub node with category id ${firstNodeCompositeIdentifier}`, () => {
            cy.getByDataAttribute(firstNodeCompositeIdentifier).should('be.visible');
        });

        describe('walking the tree category nodes', () => {
            it(`should find category the tree node with category id ${nestedNodeCompositeIdentifier}`, () => {
                treeWalkNodeIds.forEach((nodeIdSequenceNumber) => {
                    const nodeCompositeIdentifier = `${dummyCompositeIdPrefix}${nodeIdSequenceNumber}`;

                    cy.getByDataAttribute(nodeCompositeIdentifier).click();
                });
            });

            it(`should open the accordion of a categorized resource for nested category id ${nestedNodeCompositeIdentifier}`, () => {
                treeWalkNodeIds.forEach((nodeIdSequenceNumber) => {
                    const nodeCompositeIdentifier = `${dummyCompositeIdPrefix}${nodeIdSequenceNumber}`;

                    cy.getByDataAttribute(nodeCompositeIdentifier).click();

                    if (nodeCompositeIdentifier === nestedNodeCompositeIdentifier) {
                        cy.getByDataAttribute(accordionTestId).should('be.visible');

                        cy.getByDataAttribute(accordionTestId).click();
                    }
                });
            });
        });
    });
});
