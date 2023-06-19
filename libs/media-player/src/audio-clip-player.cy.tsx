import { useState } from 'react';
import { AudioClipPlayer, IPlayButton } from './lib/audio-clip-player';

describe('<AudioClipPlayer />', () => {
    let audios: HTMLAudioElement[];

    let playedThrough: string[];

    const OriginalAudio = window.Audio;

    // use coscrad media lib
    const validAudioUrl = 'https://coscrad.org/wp-content/uploads/2023/06/hello.mp3';

    describe(`when there is a single, fixed value for audioURL`, () => {
        beforeEach(() => {
            audios = [];

            cy.stub(window, 'Audio').callsFake((url: string) => {
                const newAudio = new OriginalAudio(url);

                audios.push(newAudio);

                return newAudio;
            });
        });

        describe(`when there is a valid audio url`, () => {
            beforeEach(() => {
                cy.mount(<AudioClipPlayer audioUrl={validAudioUrl} />);
            });

            describe(`when the button is clicked one time`, () => {
                it('should play audio', () => {
                    const numberOfTimesToPlay = 1;

                    /**
                     * One audio instance is used to validate the URL. Note that this
                     * information here kind of couples us to the implementation. The
                     * alternative is to set an `onPlay` callback that increments a counter
                     * in the Audio stub. We decided that is overkill, but if we
                     * refactor `AudioClipPlayer` and this test fails, we might as
                     * well do things that way.
                     */
                    const expectedNumberOfAudioInstancesCreated = numberOfTimesToPlay + 1;

                    // TODO leverage a custom `getByDataAttribute` command
                    cy.get(`button`).click();

                    // wait for the Audio.play() promise to resolve
                    cy.wait(300);

                    cy.wrap(audios).should('have.lengthOf', expectedNumberOfAudioInstancesCreated);
                });
            });

            describe(`when the button is clicked five times`, () => {
                it('should play audio', () => {
                    const numberOfTimesToPlay = 5;

                    // one audio instance is used to validate the URL
                    const expectedNumberOfAudioInstancesCreated = numberOfTimesToPlay + 1;

                    Array(numberOfTimesToPlay)
                        .fill('')
                        .forEach((_, _index) => {
                            cy.get(`button`).click();

                            cy.wait(300);
                        });

                    cy.wrap(audios).should('have.lengthOf', expectedNumberOfAudioInstancesCreated);
                });
            });
        });

        describe(`when a custom play button is provided`, () => {
            const DummyPlayButton: IPlayButton = ({ onButtonClick }) => (
                <button onClick={onButtonClick}>Play</button>
            );

            beforeEach(() => {
                cy.mount(
                    <AudioClipPlayer
                        audioUrl={validAudioUrl}
                        UserDefinedPlayButton={DummyPlayButton}
                    />
                );
            });

            it('should play audio', () => {
                const numberOfTimesToPlay = 1;

                // we count the trial instance that is used to validate the url
                const expectedNumberOfAudioInstancesCreated = numberOfTimesToPlay + 1;

                // TODO leverage a custom `getByDataAttribute` command
                cy.get(`button`).click();

                // wait for the Audio.play() promise to resolve
                cy.wait(300);

                cy.wrap(audios).should('have.lengthOf', expectedNumberOfAudioInstancesCreated);
            });
        });

        const expectedErrorMessageText = 'Audio url is not supported.';

        describe(`when the audio URL is invalid`, () => {
            beforeEach(() => {
                cy.mount(<AudioClipPlayer audioUrl="www.bogus.com/jamz123.mp3" />);

                cy.wait(300);
            });

            it('should not play audio', () => {
                cy.contains(expectedErrorMessageText);
            });
        });

        describe(`when the audio URL is undefined`, () => {
            beforeEach(() => {
                cy.mount(<AudioClipPlayer audioUrl={undefined as unknown as string} />);
            });

            it(`should not play audio`, () => {
                cy.contains(expectedErrorMessageText);
            });
        });

        describe(`when the audio URL is null`, () => {
            beforeEach(() => {
                cy.mount(<AudioClipPlayer audioUrl={null as unknown as string} />);
            });

            it(`should not play audio`, () => {
                cy.contains(expectedErrorMessageText);
            });
        });
    });

    describe(`when the component is rerendered with a different audio URL`, () => {
        const alternateUrl =
            'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock1_533847__tosha73__distortion-guitar-power-chord-e.wav';

        const dummyUrls = [validAudioUrl, alternateUrl];

        const DummyParentComponent = ({ urls }: { urls: string[] }) => {
            const [index, setIndex] = useState(0);

            return (
                <div>
                    <AudioClipPlayer audioUrl={urls[index]} />
                    <br />
                    <br />
                    <br />

                    <p
                        data-testid="toggleUrl"
                        onClick={() => {
                            setIndex((index + 1) % 2);
                        }}
                    >
                        Click to Change
                    </p>
                </div>
            );
        };

        beforeEach(() => {
            audios = [];

            playedThrough = [];

            cy.stub(window, 'Audio').callsFake((url: string) => {
                const newAudio = new OriginalAudio(url);

                const onEnded = () => {
                    playedThrough.push(newAudio.src);
                };

                newAudio.addEventListener('ended', onEnded);

                audios.push(newAudio);

                return newAudio;
            });
        });

        beforeEach(() => {
            cy.mount(<DummyParentComponent urls={dummyUrls} />);
        });

        it(`should play the audio all the way through when updating the audioURL after playing`, () => {
            cy.get(`button`).click();

            cy.wait(50);

            cy.get('p').click();

            //  TODO use a shorter audio clip
            cy.wait(9000);

            cy.wrap(playedThrough).should('include.members', [validAudioUrl]);
        });

        it(`should play multiple clips in sequence`, () => {
            // play
            cy.get(`button`).click();

            cy.wait(9000);

            // toggle source
            cy.get('p').click();

            // play
            cy.get(`button`).click();

            // intentionally introduce overlap
            cy.wait(1000);

            // toggle source
            cy.get('p').click();

            // play
            cy.get('button').click();

            cy.wait(9000);

            cy.wrap(playedThrough).should('include.ordered.members', [
                validAudioUrl,
                alternateUrl,
                validAudioUrl,
            ]);
        });
    });
});
