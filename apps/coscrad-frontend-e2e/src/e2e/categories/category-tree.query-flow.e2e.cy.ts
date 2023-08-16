type NodesToVisit = {
    idSequenceNumber: number;
    categoryLabel: string;
};

describe('Categories Tree (Tree of Knowledge) flow', () => {
    const pageLabel = 'Tree of Knowledge';

    const dummyCompositeIdPrefix = 'category/9b1deb4d-3b7d-4bad-9bdd-2b0d7b11000';

    const rootNodeCompositeIdentifier = `${dummyCompositeIdPrefix}0`;

    const firstNodeCompositeIdentifier = `${dummyCompositeIdPrefix}1`;

    const firstNodeCategoryLabel = 'animals';

    const nestedNodeCompositeIdentifier = `${dummyCompositeIdPrefix}7`;

    const accordionTestId = `resources-for-${nestedNodeCompositeIdentifier}`;

    const categorizedResourceMetadataText = 'Susie McRealart';

    const nodesToVisit: NodesToVisit[] = [
        { idSequenceNumber: 1, categoryLabel: 'animals' },
        { idSequenceNumber: 2, categoryLabel: 'mammals' },
        { idSequenceNumber: 5, categoryLabel: 'felines' },
        { idSequenceNumber: 7, categoryLabel: 'domestic cats' },
    ];

    beforeEach(() => {
        cy.visit('/TreeOfKnowledge');
    });

    describe('the tree of knowledge', () => {
        it(`should display the label "${pageLabel}"`, () => {
            cy.contains(pageLabel);
        });
    });

    describe('when the root node is open', () => {
        beforeEach(() => {
            cy.getByDataAttribute(rootNodeCompositeIdentifier).click();
        });

        it(`should display the first sub node with category id ${firstNodeCompositeIdentifier}`, () => {
            cy.getByDataAttribute(firstNodeCompositeIdentifier).should('be.visible');
        });

        it(`should display the first sub node category text "${firstNodeCategoryLabel}"`, () => {
            cy.getByDataAttribute(firstNodeCompositeIdentifier).contains(firstNodeCategoryLabel);
        });

        describe('when the first branch of the tree is fully expanded', () => {
            beforeEach(() => {
                nodesToVisit.forEach(({ idSequenceNumber }: NodesToVisit) => {
                    const nodeCompositeIdentifier = `${dummyCompositeIdPrefix}${idSequenceNumber}`;

                    cy.getByDataAttribute(nodeCompositeIdentifier).click();
                });

                cy.getByDataAttribute(accordionTestId).click();
            });

            describe(`the first node`, () => {
                const { idSequenceNumber, categoryLabel } = nodesToVisit[0];

                const firstNodeId = `${dummyCompositeIdPrefix}${idSequenceNumber}`;

                it(`should have the id "${firstNodeId}" and category label "${categoryLabel}"`, () => {
                    cy.getByDataAttribute(firstNodeId).should('be.visible');

                    cy.getByDataAttribute(firstNodeId).contains(categoryLabel);
                });
            });

            describe(`the third node`, () => {
                const { idSequenceNumber, categoryLabel } = nodesToVisit[2];

                const firstNodeId = `${dummyCompositeIdPrefix}${idSequenceNumber}`;

                it(`should have the id "${firstNodeId}" and category label "${categoryLabel}"`, () => {
                    cy.getByDataAttribute(firstNodeId).should('be.visible');

                    cy.getByDataAttribute(firstNodeId).contains(categoryLabel);
                });
            });

            describe(`the fourth node`, () => {
                const { idSequenceNumber, categoryLabel } = nodesToVisit[3];

                const firstNodeId = `${dummyCompositeIdPrefix}${idSequenceNumber}`;

                it(`should have the id "${firstNodeId}" and category label "${categoryLabel}"`, () => {
                    cy.getByDataAttribute(firstNodeId).should('be.visible');

                    cy.getByDataAttribute(firstNodeId).contains(categoryLabel);
                });

                it(`should have categorized resources`, () => {
                    cy.getByDataAttribute(accordionTestId).should('be.visible');
                });

                it(`should have categorized resources containing the text "${categorizedResourceMetadataText}"`, () => {
                    cy.getByDataAttribute(accordionTestId).contains(
                        categorizedResourceMetadataText
                    );
                });
            });
        });
    });
});
