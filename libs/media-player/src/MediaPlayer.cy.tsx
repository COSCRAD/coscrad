import { MediaPlayer } from './lib/MediaPlayer';

const beAudible = (option?: 'not') => (els: JQuery<HTMLAudioElement>) => {
    let audible = false;

    els.each((_i, el) => {
        if (el.duration > 0 && !el.paused && !el.muted) {
            audible = true;
        }

        // expect(el.duration > 0 && !el.paused && !el.muted).to.eq(false)
    });

    expect(audible).to.eq(option === 'not' ? false : true);
};

describe('<MediaPlayer />', () => {
    const waitBetween = (waitForMs = 100) => {
        cy.wait(waitForMs);
    };

    describe(`when there is a valid audio url`, () => {
        const validAudioUrl = 'https://be.tsilhqotinlanguage.ca:3003/download?id=hello.mp3';

        beforeEach(() => {
            cy.mount(<MediaPlayer audioUrl={validAudioUrl} listenMessage="listen now!" />);
        });

        it('should be disabled on mount', () => {
            cy.get('button').should('be.disabled');
        });

        it('should show play icon initially', () => {
            cy.getByDataAttribute('play-icon');
        });

        it('should play audio', () => {
            cy.getByDataAttribute('audio-play-button').click();

            cy.get('audio').should(beAudible());

            cy.getByDataAttribute('pause-icon');
        });

        it('should pause audio that is already playing', () => {
            //play audio
            cy.getByDataAttribute('audio-play-button').click();

            waitBetween();

            //pause audio
            cy.getByDataAttribute('audio-play-button').click();

            waitBetween();

            cy.get('audio').should(beAudible('not'));

            cy.getByDataAttribute('play-icon');
        });

        it('should resume playing after pausing', () => {
            cy.getByDataAttribute('audio-play-button').click().as('click');

            waitBetween();

            cy.get('@click');

            waitBetween();

            cy.get('@click');

            waitBetween();

            cy.getByDataAttribute('pause-icon');
        });

        it('should update the icon on play-end', () => {
            cy.getByDataAttribute('audio-play-button').click();

            cy.wait(10000);

            cy.getByDataAttribute('play-icon');
        });
    });
});
