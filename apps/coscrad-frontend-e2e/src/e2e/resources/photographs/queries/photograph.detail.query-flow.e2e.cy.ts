import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { buildDummyAggregateCompositeIdentifier } from '../../../../support/utilities';

const aggregateCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.photograph,
    2
);

const aggregateCompositeIdentifierNoNotes = buildDummyAggregateCompositeIdentifier(
    AggregateType.photograph,
    3
);

const mediaItemCompositeIdentifier = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    12
);

const mediaItemCompositeIdentifierNoNotes = buildDummyAggregateCompositeIdentifier(
    AggregateType.mediaItem,
    13
);

const buildRoute = (id: string) => `/Resources/Photographs/${id}`;

const photographTitle = 'My Photo';

const photographTitleNoNotes = 'My Photo without any notes';

const languageCodeForTitle = LanguageCode.Haida;

const validPhotographDetailRoute = buildRoute(aggregateCompositeIdentifier.id);

const noteText = 'This is a note about a photograph';

describe(`the photograph detail page`, () => {
    describe(`when the photograph with the given ID 123 does not exist`, () => {
        beforeEach(() => {
            cy.visit(buildRoute(`123`));
        });

        it(`should display the not found page`, () => {
            cy.getByDataAttribute('not-found');
        });
    });

    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(200);

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
            title: 'My photo of Masset',
            mimeType: MIMEType.jpg,
            // Override default value to "remove" property from fsa for image media item
            lengthMilliseconds: null,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
            aggregateCompositeIdentifier,
            title: photographTitle,
            languageCodeForTitle,
            mediaItemId: mediaItemCompositeIdentifier.id,
            heightPx: 800,
            widthPx: 200,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier,
        });

        cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
            aggregateCompositeIdentifier: buildDummyAggregateCompositeIdentifier(
                AggregateType.note,
                15
            ),
            resourceCompositeIdentifier: aggregateCompositeIdentifier,
            text: noteText,
        });

        cy.seedDataWithCommand(`CREATE_MEDIA_ITEM`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifierNoNotes,
            title: 'My photo of Skidegate with no notes',
            mimeType: MIMEType.jpg,
            // Override default value to "remove" property from fsa for image media item
            lengthMilliseconds: null,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: mediaItemCompositeIdentifierNoNotes,
        });

        cy.seedDataWithCommand(`CREATE_PHOTOGRAPH`, {
            aggregateCompositeIdentifier: aggregateCompositeIdentifierNoNotes,
            title: photographTitleNoNotes,
            languageCodeForTitle,
            mediaItemId: mediaItemCompositeIdentifierNoNotes.id,
            heightPx: 800,
            widthPx: 200,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: aggregateCompositeIdentifierNoNotes,
        });
    });

    describe(`when the photograph exists`, () => {
        beforeEach(() => {
            cy.visit(validPhotographDetailRoute);
        });

        it(`should contain the photograph name`, () => {
            cy.contains(photographTitle);

            cy.getByDataAttribute('LanguageIcon').first().trigger('mouseover');

            cy.contains("Haida, 'original'");
        });
    });

    describe('when there are notes for the Photograph (2)', () => {
        beforeEach(() => {
            cy.visit(validPhotographDetailRoute);
        });

        it(`should display the note text:\n${noteText}`, () => {
            cy.openPanel('notes');

            cy.contains(noteText);
        });
    });

    describe('when there are no notes for the Photograph (3)', () => {
        beforeEach(() => {
            cy.visit(`/Resources/Photographs/${aggregateCompositeIdentifierNoNotes.id}`);
        });

        it(`should display the no notes message`, () => {
            cy.contains(photographTitleNoNotes);

            cy.openPanel('notes');

            cy.contains('No Notes Found');
        });
    });
});
