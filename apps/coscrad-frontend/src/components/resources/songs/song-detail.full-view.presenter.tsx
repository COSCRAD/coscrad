import { IDetailQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Card, Divider } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { formatBilingualText } from '../vocabulary-lists/utils';
import { CreditsHack } from './credits-hack';
import { SongLyrics } from './song-lyrics';

export const SongDetailFullViewPresenter = ({
    data: { id, title, titleEnglish, lyrics, audioURL },
}: IDetailQueryResult<ISongViewModel>): JSX.Element => {
    const { songIdToCredits } = useContext(ConfigurableContentContext);

    const creditsMap = new Map<string, string>(
        Object.entries(songIdToCredits as Record<string, string>)
    );

    return (
        <div data-testid={id}>
            <Card className="detail-card">
                <div id="detail-term" className="detail-meta">
                    {formatBilingualText(title, titleEnglish)}
                </div>
                <Divider id="detail-divider" />

                <div className="detail-meta">
                    <h3 className="detail-headers">Contributions:</h3>
                    TODO use config for this
                </div>
                <div className="detail-meta">
                    {typeof lyrics === 'string' && <SongLyrics lyrics={lyrics} />}
                </div>
                <div id="media-player">
                    <MediaPlayer listenMessage="Play" audioUrl={audioURL} />
                </div>
                <div className="detail-meta">
                    <CreditsHack resourceId={id} creditsMap={creditsMap} />
                </div>
            </Card>
        </div>
    );
};
