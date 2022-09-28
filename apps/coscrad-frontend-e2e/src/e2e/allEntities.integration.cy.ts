describe.skip('all entities', () => {
    it('should populate the page with entity data', () => {
        // TODO either share with backend or pull from api?
        const entityTypes = ['term', 'vocabularyList', 'tag'];

        const entityDescriptions = entityTypes.map((entityType) => `description of ${entityType}`);

        const entityTypesAndDescriptions = entityTypes.reduce(
            (accumulator, entityType, index) => ({
                ...accumulator,
                [entityType]: entityDescriptions[index],
            }),
            {}
        );

        cy.visit('/allEntities');

        cy.intercept(
            'GET',
            (() => {
                console.log(`INTERCEPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPT`);
                return 'http://104.225.142.106:3131/entities/descriptions';
            })(),
            'boo'
        );

        entityTypes.forEach((entityType) => cy.get(`[data-cy-entity-type=${entityType}]`));
    });
});
