import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { MediaTimeline } from './lib/media-timeline';
import { TICK_SPACING_FACTOR } from './lib/media-timeline-ruler-tick';

const mediaDuration = 25;

const selectionStartMilliseconds = 1.2;

const selectionEndMilliseconds = 3.4;

// could set fixed width of parent element and then test against known width
const MediaTimelineWidget = (): JSX.Element => {
    const [playProgress, setPlayProgress] = useState<number>(0);

    return (
        <>
            <MediaTimeline
                mediaDuration={mediaDuration}
                playProgress={playProgress}
                selectionStartMilliseconds={selectionStartMilliseconds}
                selectionEndMilliseconds={selectionEndMilliseconds}
            />
            <Box>
                <Typography>playProgress: {playProgress}</Typography>
            </Box>
        </>
    );
};

describe(`<MediaTimeline />`, () => {
    describe(`when the timeline is first loaded`, () => {
        beforeEach(() => {
            const playProgress = 0;

            cy.mount(
                <MediaTimeline
                    mediaDuration={mediaDuration}
                    playProgress={playProgress}
                    selectionStartMilliseconds={selectionStartMilliseconds}
                    selectionEndMilliseconds={selectionEndMilliseconds}
                />
            );
        });

        it.only('should display the timeline with the right duration', () => {
            cy.getByDataAttribute('media-timeline').should('exist');

            const rulerLengthTicks = cy.get('[data-cy^="ruler-tick-"]');

            cy.getByDataAttribute('media-timeline')
                .then(($el) => {
                    if ($el === undefined) return null;
                    return window.getComputedStyle($el[0]);
                })
                .invoke('getPropertyValue', 'width')
                .then((width) => {
                    return parseInt(width.replace('px', ''));
                })
                .then((editorWidth) => {
                    return mediaDuration > editorWidth
                        ? Math.ceil(mediaDuration)
                        : Math.ceil(editorWidth / TICK_SPACING_FACTOR);
                })
                .then((rulerLength) => {
                    cy.get('[data-cy^="ruler-tick-"]').its('length').should('eq', rulerLength);
                });
        });

        it('should start with the playhead at zero', () => {
            cy.getByDataAttribute('playhead')
                .then(($el) => {
                    if ($el === undefined) return null;
                    return window.getComputedStyle($el[0]);
                })
                .invoke('getPropertyValue', 'left')
                .then((left) => {
                    const leftInt = parseInt(left.replace('px', ''));

                    expect(leftInt).to.equal(0);
                });
        });
    });

    describe(`when the play progress is augmented`, () => {
        beforeEach(() => {
            const playProgress = 80;

            cy.mount(
                <MediaTimeline
                    mediaDuration={mediaDuration}
                    playProgress={playProgress}
                    selectionStartMilliseconds={selectionStartMilliseconds}
                    selectionEndMilliseconds={selectionEndMilliseconds}
                />
            );
        });

        it.skip('the playhead should move right', () => {
            cy.getByDataAttribute('playhead')
                .then(($el) => {
                    if ($el === undefined) return null;
                    return window.getComputedStyle($el[0]);
                })
                .invoke('getPropertyValue', 'left')
                .then((left) => {
                    const leftInt = parseInt(left.replace('px', ''));

                    expect(leftInt).to.equal(80);
                });
        });
    });
});
