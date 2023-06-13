import { AudioClipPlayer } from './lib/audio-clip-player';

describe('<AudioClipPlayer />', () => {
    let audios: HTMLAudioElement[];

    const OriginalAudio = window.Audio;

    beforeEach(() => {
        audios = [];

        cy.stub(window, 'Audio').callsFake((url: string) => {
            const newAudio = new OriginalAudio(url);

            audios.push(newAudio);

            return newAudio;
        });
    });

    // use coscrad media lib
    const validAudioUrl = 'https://be.tsilhqotinlanguage.ca:3003/download?id=hello.mp3';

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

    describe(`when the audio URL is invalid`, () => {
        beforeEach(() => {
            cy.mount(<AudioClipPlayer audioUrl="www.bogusboogers.com/jamz123.mp3" />);

            cy.wait(300);
        });

        it('should not play audio', () => {
            const expectedErrorMessageText = 'audio not available';

            cy.contains(expectedErrorMessageText);
        });
    });
});
