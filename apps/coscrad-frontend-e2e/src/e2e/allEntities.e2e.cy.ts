describe.skip('all entities', () => {
    it('should populate the page with entity data', () => {
        // TODO either share with backend or pull from api?
        const entityTypes = ['term', 'vocabularyList', 'tag'];

        cy.visit('/allEntities');

        entityTypes.forEach((entityType) => cy.get(`[data-cy-entity-type=${entityType}]`));
    });
});
