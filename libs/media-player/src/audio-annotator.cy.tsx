import { Box, Stack, Typography, styled } from '@mui/material';
import { useCallback, useState } from 'react';
import { AudioAnnotator, TimeRangeSelection } from './lib/audio-annotator';

const Item = styled(Box)`
    margin-bottom: 5px;
`;

interface AudioAnnotatorWidgetProps {
    audioUrl: string;
}

/**
 * This widget will be for testing interaction with the parent component state
 */
const AudioAnnotatorWidget = ({ audioUrl }: AudioAnnotatorWidgetProps): JSX.Element => {
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeSelection | null>(null);

    const onTimeRangeSelected = useCallback(
        (selectedTimeRange: TimeRangeSelection | null) => {
            setSelectedTimeRange(selectedTimeRange);
        },
        [setSelectedTimeRange]
    );

    return (
        <Stack>
            <Item>
                <Typography variant="h5">AudioAnnotatorWidget (Wrapper to the Audio)</Typography>
            </Item>
            <Item>
                <AudioAnnotator audioUrl={audioUrl} onTimeRangeSelected={onTimeRangeSelected} />
            </Item>
            {selectedTimeRange !== null ? (
                <Item
                    data-testid="widget-selected-time-range"
                    sx={{ backgroundColor: '#ccc', p: 2, mt: 2 }}
                >
                    <Typography variant="h5">Valid Time Range Selected:</Typography>
                    <Box p={2}>
                        <Typography variant="h6">
                            inPoint: {selectedTimeRange.inPointSeconds}
                        </Typography>
                        <Typography variant="h6">
                            outPoint: {selectedTimeRange.outPointSeconds}
                        </Typography>
                    </Box>
                </Item>
            ) : null}
        </Stack>
    );
};

describe('<AudioAnnotator />', () => {
    const validAudioUrl =
        'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock2_370934__karolist__guitar-solo.mp3';

    const validShorterDurationAudioUrl =
        'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock1_533847__tosha73__distortion-guitar-power-chord-e.wav';

    const invalidAudioUrl = 'not-a-url';

    describe(`when the audio url is invalid and no media loads`, () => {
        beforeEach(() => {
            cy.mount(<AudioAnnotatorWidget audioUrl={invalidAudioUrl} />);
        });

        /**
         * Note: the markInPoint() and markOutPoint() methods return if the media currentTime
         * is null or undefined so we don't need an equivalent 'disabled' functionality
         * or test for the keyboard shortcuts
         */
        describe(`the mark in- and out-point buttons`, () => {
            it(`should be disabled`, () => {
                cy.getByDataAttribute('in-point-marker-button').should('be.disabled');

                cy.getByDataAttribute('out-point-marker-button').should('be.disabled');
            });
        });
    });

    describe(`when there is a valid value for audioUrl`, () => {
        beforeEach(() => {
            cy.mount(<AudioAnnotatorWidget audioUrl={validAudioUrl} />);
        });

        it('should display audio controls', () => {
            cy.get('audio').should('be.visible');

            cy.get('audio').should('have.prop', 'controls', true);
        });

        describe(`when the media first loads`, () => {
            before(() => {
                cy.wait(1000);
            });

            describe(`the mark in-point button`, () => {
                it(`should be enabled`, () => {
                    cy.getByDataAttribute('in-point-marker-button').should('be.enabled');
                });
            });

            describe(`the mark out-point button`, () => {
                it(`should be disabled`, () => {
                    cy.getByDataAttribute('out-point-marker-button').should('be.disabled');
                });
            });
        });

        describe(`when the media has been played`, () => {
            beforeEach(() => {
                cy.get('audio').then(([audioElement]) => {
                    audioElement.play();
                });

                cy.wait(1500);
            });

            describe(`when the mark in-point button is clicked`, () => {
                it.only(`should mark an in-point`, () => {
                    cy.getByDataAttribute('in-point-marker-button').click();

                    cy.getByDataAttribute('in-point-selection-time-code').should('exist');

                    cy.getByDataAttribute('inpoint-selected-bar').should('be.visible');
                });
            });

            describe(`when the keyboard shortcut for mark in-point is pressed`, () => {
                it(`should mark an in-point`, () => {
                    cy.get('body').type('i');
                });
            });

            describe(`when the mark in-point button is clicked, the mark out-point button`, () => {
                it('should be enabled', () => {
                    cy.getByDataAttribute('in-point-marker-button').click();

                    cy.wait(300);

                    cy.getByDataAttribute('out-point-marker-button').should('be.enabled');
                });
            });

            describe(`when the mark in-point button is clicked, clicking the mark out-point button`, () => {
                it('should mark an out-point', () => {
                    cy.getByDataAttribute('in-point-marker-button').click();

                    cy.wait(1000);

                    cy.getByDataAttribute('out-point-marker-button').click();

                    cy.getByDataAttribute('widget-selected-time-range').should('exist');
                });
            });

            describe(`when the mark in-point button is clicked and the user scrubs the playhead back before the in-point, clicking the mark out-point button`, () => {
                it('should fail with an error', () => {
                    cy.wait(1000);

                    cy.getByDataAttribute('in-point-marker-button').click();

                    cy.get('audio').then(([audioElement]) => {
                        audioElement.currentTime = 1.0;
                    });

                    cy.getByDataAttribute('out-point-marker-button').click();

                    cy.getByDataAttribute('widget-selected-time-range').should('not.exist');

                    cy.getByDataAttribute('audio-error-message').should('exist');
                });
            });

            describe(`after an in-point is selected, when the clear range button is clicked`, () => {
                it('should clear the selected in-point', () => {
                    cy.getByDataAttribute('in-point-marker-button').click();

                    cy.wait(500);

                    cy.getByDataAttribute('clear-selected-time-range-button').click();

                    cy.getByDataAttribute('widget-selected-time-range').should('not.exist');

                    cy.getByDataAttribute('out-point-marker-button').should('be.disabled');
                });
            });

            describe(`after a time range is selected, when the clear range button is clicked`, () => {
                it('should clear the range selection', () => {
                    cy.getByDataAttribute('in-point-marker-button').click();

                    cy.wait(1000);

                    cy.getByDataAttribute('out-point-marker-button').click();

                    cy.getByDataAttribute('widget-selected-time-range').should('exist');

                    cy.wait(500);

                    cy.getByDataAttribute('clear-selected-time-range-button').click();

                    cy.getByDataAttribute('widget-selected-time-range').should('not.exist');
                });
            });

            describe(`after a time range is selected with hotkeys, when clear range is invoked with "c"`, () => {
                it('should clear the range selection', () => {
                    cy.get('body').type('i');

                    cy.wait(1000);

                    cy.get('body').type('o');

                    cy.getByDataAttribute('widget-selected-time-range').should('exist');

                    cy.wait(600);

                    cy.get('body').type('c');

                    cy.getByDataAttribute('widget-selected-time-range').should('not.exist');

                    cy.getByDataAttribute('inpoint-selected-bar').should('not.be.visible');

                    cy.getByDataAttribute('timerange-selected-bar').should('not.be.visible');
                });
            });
        });
    });

    describe('given a valid audio url', () => {
        describe(`when the mark in- and out-point buttons are clicked after the end of audio play`, () => {
            it('should fail to create a time range selection', () => {
                cy.mount(<AudioAnnotatorWidget audioUrl={validShorterDurationAudioUrl} />);

                cy.get('audio').then(([audioElement]) => {
                    audioElement.play();
                });
                cy.wait(6000);

                cy.getByDataAttribute('in-point-marker-button').click();

                cy.wait(300);

                cy.getByDataAttribute('out-point-marker-button').click();

                cy.getByDataAttribute('widget-selected-time-range').should('not.exist');
            });
        });
    });
});
