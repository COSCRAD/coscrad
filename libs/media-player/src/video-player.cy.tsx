import { VideoPlayer } from './lib/video-player';

describe('<VideoPlayer />', () => {
    const validVideoUrl =
        'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4';

    describe(`when there is a single, fixed value for videoURL`, () => {
        describe(`when there is a valid video url`, () => {
            beforeEach(() => {
                cy.mount(<VideoPlayer videoUrl={validVideoUrl} />);
            });

            it('should display video controls', () => {
                cy.get('video').should('be.visible');
                cy.get('video').should('have.prop', 'controls', true);
            });

            it(`should play video`, () => {
                cy.get('video')
                    .should('have.prop', 'paused', true)
                    .and('have.prop', 'ended', false)
                    .then(($video) => {
                        $video[0].play();
                    });
                cy.wait(2000);
            });

            it(`should pause video`, () => {
                cy.get('video')
                    .should('have.prop', 'paused', true)
                    .and('have.prop', 'ended', false)
                    .then(($video) => {
                        $video[0].play();
                    });
                cy.wait(4000);
                cy.get('video').then(($video) => {
                    $video[0].pause();
                });
            });
        });
    });
});
