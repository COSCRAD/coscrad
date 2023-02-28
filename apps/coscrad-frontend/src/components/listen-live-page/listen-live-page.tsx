import { MediaPlayer } from '@coscrad/media-player';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export interface AboutProps {
    about: string;
}

export const ListenLivePage = (): JSX.Element => {
    const {
        listenLive: { iceCastLink: link, playingMessage, title, logoUrl, missionStatement },
    } = useContext(ConfigurableContentContext);

    return (
        <div>
            {/* TODO [https://www.pivotaltracker.com/story/show/184406691] update media player to display play message */}
            {title}
            <img src={logoUrl} alt="logo" />
            <MediaPlayer audioUrl={link} listenMessage={playingMessage} />
            {playingMessage}
            {missionStatement}
        </div>
    );
};
