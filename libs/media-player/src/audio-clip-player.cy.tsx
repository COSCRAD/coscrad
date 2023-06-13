import { AudioClipPlayer } from './lib/audio-clip-player';
import { DefaultPlayPauseButton } from './lib/default-play-pause-button';

describe('<AudioClipPlayer />', () => {
    describe(`when there is a valid audio url`, () => {
        const validAudioUrl = 'https://be.tsilhqotinlanguage.ca:3003/download?id=hello.mp3';

        it('should render', () => {
            // see: https://on.cypress.io/mounting-react
            cy.mount(
                <AudioClipPlayer
                    audioUrl={validAudioUrl}
                    PlayPauseButton={DefaultPlayPauseButton}
                />
            );
        });
    });
});
