import { ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';
import { buildDummySongs } from './test-utils/build-dummy-songs';

jest.spyOn(window.HTMLMediaElement.prototype, 'pause')
    /* eslint-disable-next-line */
    .mockImplementation(() => {});

jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

const dummySongs = buildDummySongs();

const songToFind = dummySongs[0];

const { id: idToFind } = songToFind;

const endpoint = `${getConfig().apiUrl}/resources/songs`;

const act = buildCategorizableDetailPageRendererForTest(ResourceType.song);

const mockGetNotesHandler = buildMockGetNotesHandler();

describe('song detail', () => {
    /**
     * TODO [https://www.pivotaltracker.com/story/show/185546456]
     * Test error handling \ loading state with Cypress and remove this test
     */
    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
