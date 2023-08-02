import { AggregateType } from '@coscrad/api-interfaces';

const videoTitleInLanguage = `Video Title`;

const buildId = (id: string) => `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100${id}`;

const buildAggregateCompositeIdentifier = (id: string) => ({
    type: AggregateType.video,
    id: buildId(id),
});

const videoAggregateCompositeIdentifier = buildAggregateCompositeIdentifier('001');

const videoDetailRoute = `/Resources/Videos/${videoAggregateCompositeIdentifier}`;

const validUrl =
    'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4';

describe(`the video detail page`, () => {
    before(() => {
        cy.clearDatabase();

        cy.seedTestUuids(10);

        cy.seedDataWithCommand(`CREATE_VIDEO`, {
            title: videoTitleInLanguage,
            aggregateCompositeIdentifier: videoAggregateCompositeIdentifier,
            videourl: validUrl,
        });

        cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
            aggregateCompositeIdentifier: videoAggregateCompositeIdentifier,
        });
    });

    beforeEach(() => {
        cy.visit(videoDetailRoute);
    });

    describe(`when visiting the detail route with a bogus ID`, () => {
        beforeEach(() => {
            cy.visit(`/Resources/Videos/${buildId('987')}`);

            cy.getByDataAttribute('not-found');
        });
    });

    describe(`when the video is missing optional properties`, () => {
        it(`should display the video title`, () => {
            cy.contains(videoTitleInLanguage);
        });
    });

    describe(`when the video has all properties`, () => {
        beforeEach(() => {
            // TODO troubleshoot this
            cy.spy(window.HTMLVideoElement.prototype, 'play');
        });

        it(`should render the video title`, () => {
            cy.contains(videoTitleInLanguage);
        });

        /**
         * We don't need to test the functionality of the copy ID button, as this
         * is done elsewhere. We merely check that it is available here.
         */
        it(`should expose the copy ID button`, () => {
            cy.getByDataAttribute(`copy-id`);
        });

        // TODO verify this
        it.skip(`should play the video`, () => {
            cy.getByDataAttribute(`video-for-${validUrl}`).click();
            // TODO spy on Audio and assert it gets played.

            expect(window.HTMLVideoElement.prototype.play).to.be.calledOnce;
        });

        describe(`the connection and notes panels`, () => {
            describe(`when there are no notes or connections`, () => {
                it(`should display No Notes`, () => {
                    cy.getByDataAttribute(`open-notes-panel-button`).click();

                    cy.contains(`No Notes`);
                });

                it(`should display No Connections`, () => {
                    cy.getByDataAttribute(`open-connected-resources-panel-button`).click();

                    cy.contains(`No Connections`);
                });
            });

            describe(`when there is a note`, () => {
                const noteText = `This is about dinosaurs.`;

                describe(`with general context`, () => {
                    beforeEach(() => {
                        cy.seedDataWithCommand(`CREATE_NOTE_ABOUT_RESOURCE`, {
                            aggregateCompositeIdentifier: {
                                id: buildId(`002`),
                                type: AggregateType.note,
                            },
                            resourceCompositeIdentifier: videoAggregateCompositeIdentifier,
                            text: noteText,
                        });

                        cy.visit(videoDetailRoute);
                    });

                    it(`should display the note`, () => {
                        cy.getByDataAttribute(`open-notes-panel-button`).click();

                        cy.contains(noteText);
                    });

                    it(`should close the notes panel on demand`, () => {
                        cy.getByDataAttribute(`open-notes-panel-button`).click();

                        cy.contains(noteText);

                        cy.getByDataAttribute(`close-notes-panel-button`).click();

                        cy.contains(noteText).should('not.exist');
                    });
                });
            });

            describe(`when there is a connection`, () => {
                const connectingNoteText = `that is why this video is connected to that term`;

                const termText = `Dinosaur`;

                const termCompositeIdentifier = {
                    type: AggregateType.term,
                    id: buildId(`003`),
                };

                beforeEach(() => {
                    // create the connected term
                    // TODO We'll need to update this when there's a proper translation flow
                    cy.seedDataWithCommand(`CREATE_TERM`, {
                        aggregateCompositeIdentifier: termCompositeIdentifier,
                        text: termText,
                    });

                    // publish the connected term
                    cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                        aggregateCompositeIdentifier: termCompositeIdentifier,
                    });

                    cy.seedDataWithCommand(`CONNECT_RESOURCES_WITH_NOTE`, {
                        aggregateCompositeIdentifier: {
                            type: AggregateType.note,
                            id: buildId(`004`),
                        },
                        fromMemberCompositeIdentifier: videoAggregateCompositeIdentifier,
                        toMemberCompositeIdentifier: termCompositeIdentifier,
                        text: connectingNoteText,
                    });
                });

                // Note that the connected resource panel does not currently display the note text
                it.skip(`should display the note for the connection`, () => {
                    cy.getByDataAttribute(`open-connected-resources-panel-button`).click();

                    cy.contains(connectingNoteText);

                    cy.contains(termText);
                });

                it(`should close the connected resources panel on demand`, () => {
                    cy.getByDataAttribute(`open-connected-resources-panel-button`).click();

                    cy.contains(`Connected Resources`);

                    cy.getByDataAttribute(`close-connected-resources-panel-button`).click();

                    cy.contains(`Connected Resources`).should('not.be.visible');
                });
            });
        });
    });

    // TODO test this case
    describe.skip(`when the videoUrl is invalid`, () => {
        const compositeIdForVideoWithInvalidAudioUrl = buildAggregateCompositeIdentifier('005');

        const bogusUrl = `https://www.coscrad.org/i-do-not-exist.mp4`;

        beforeEach(() => {
            // TODO We'll need to update this when there's a proper translation flow
            cy.seedDataWithCommand(`CREATE_VIDEO`, {
                title: `my video URL is bogus`,
                aggregateCompositeIdentifier: compositeIdForVideoWithInvalidAudioUrl,
                audioURL: bogusUrl,
            });

            cy.seedDataWithCommand(`PUBLISH_RESOURCE`, {
                aggregateCompositeIdentifier: compositeIdForVideoWithInvalidAudioUrl,
            });
        });

        it(`should fail gracefully`, () => {
            cy.getByDataAttribute(`video-for-${bogusUrl}`).click();

            // Ideally, we want to display the disabled icon once we find out that the URL doesn't work
            cy.getByDataAttribute('error').should('not.exist');
        });
    });
});
