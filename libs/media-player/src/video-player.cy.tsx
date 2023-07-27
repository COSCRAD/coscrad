import { VideoMIMEType, VideoPlayer } from './lib/video-player';

describe('<VideoPlayer />', () => {
    const validVideoUrl =
        'https://coscrad.org/wp-content/uploads/2023/05/Rexy-and-The-Egg-_3D-Dinosaur-Animation_-_-3D-Animation-_-Maya-3D.mp4';

    describe(`when there is a single, fixed value for videoURL`, () => {
        describe(`when there is a valid video url`, () => {
            beforeEach(() => {
                cy.mount(<VideoPlayer videoUrl={validVideoUrl} mimeType={VideoMIMEType.MP4} />);
            });

            it('should display video controls', () => {
                cy.get('video').should('be.visible');
                cy.get('video').should('have.prop', 'controls', true);
            });
        });
    });
});
