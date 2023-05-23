import { MediaPlayer } from './lib/MediaPlayer';

describe('<MediaPlayer />', () => {
    describe(`when there is a valid audio url`, () => {
        const validAudioUrl = 'https://be.tsilhqotinlanguage.ca:3003/download?id=hello.mp3';

        it('should render', () => {
            // see: https://on.cypress.io/mounting-react
            cy.mount(<MediaPlayer audioUrl={validAudioUrl} listenMessage="listen now!" />);
        });

        it('should play audio', () => {
            cy.mount(<MediaPlayer audioUrl={validAudioUrl} listenMessage="listen now!" />);

            // @ts-expect-error todo fix types
            cy.get(`[data-testid='audio-player']`).then(($els) => $els[0].play());

            cy.get('audio').should((els) => {
                let audible = false;

                els.each((_i, el) => {
                    if (el.duration > 0 && !el.paused && !el.muted) {
                        audible = true;
                    }

                    // expect(el.duration > 0 && !el.paused && !el.muted).to.eq(false)
                });

                expect(audible).to.eq(true);
            });
        });
    });
});
