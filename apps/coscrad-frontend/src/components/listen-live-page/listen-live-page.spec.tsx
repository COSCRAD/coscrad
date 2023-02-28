import { screen } from '@testing-library/react';
import { ListenLivePageConfiguration } from '../../configurable-front-matter/data/configurable-content-schema';
import { renderWithProviders } from '../../utils/test-utils';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { ListenLivePage } from './listen-live-page';

const link = 'https://www.mystream.com/stream';
const title = 'the best radio in the world';
const logoUrl = 'https://www.imagecloud.com/logo.png';
const playingMessage = 'Now Playing!';
const missionStatement = 'lots of sentences!'.repeat(15);

const dummyListenLiveConfig: ListenLivePageConfiguration = {
    iceCastLink: link,
    title,
    logoUrl,
    playingMessage,
    missionStatement,
};

const dummyConfigurableContent = {
    ...getDummyConfigurableContent(),
    listenLive: dummyListenLiveConfig,
};

const act = () =>
    renderWithProviders(<ListenLivePage />, {
        contentConfig: dummyConfigurableContent,
    });

describe('Listen Live Page', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<ListenLivePage />);
        expect(baseElement).toBeTruthy();
    });

    it('should load the logo image url from the content config', async () => {
        act();

        const logoImage = await screen.getByRole('img');

        expect(logoImage.getAttribute('src')).toEqual(logoUrl);
    });

    it('should load the title from the content config', async () => {
        act();

        const searchPattern = new RegExp(title);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });

    it('should load the misson statement from the content config', async () => {
        act();

        const searchPattern = new RegExp(missionStatement);
        const screenRes = screen.getByText(searchPattern);

        expect(screenRes).toBeTruthy();
    });

    //  it may be better to do this with cypress
    it.todo('should test the audio player and now playing message');
});
