import { AudioPlayer } from './lib/audio-player';

describe('<AudioPlayer />', () => {
    const validAudioUrl =
        'https://coscrad.org/wp-content/uploads/2023/05/metal-mondays-mock1_533847__tosha73__distortion-guitar-power-chord-e.wav';

    describe(`when there is a single, fixed value for audioURL`, () => {
        describe(`when there is a valid audio url`, () => {
            beforeEach(() => {
                cy.mount(<AudioPlayer audioUrl={validAudioUrl} />);
            });

            it('should display audio controls', () => {
                cy.get('audio').should('be.visible');
                cy.get('audio').should('have.prop', 'controls', true);
            });
        });
    });
});
