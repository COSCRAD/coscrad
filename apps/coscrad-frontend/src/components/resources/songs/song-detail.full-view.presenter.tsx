import { IDetailQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { MediaPlayer } from '../../../../../../libs/media-player/src';
import { formatBilingualText } from '../vocabulary-lists/utils';

export const SongDetailFullViewPresenter = ({
    data: { title, titleEnglish, contributions, lyrics, audioURL },
}: IDetailQueryResult<ISongViewModel>): JSX.Element => (
    <div data-testid={title}>
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
                <h3 className="detail-headers">Lyrics:</h3>
                {lyrics || 'Coming soon'}
            </div>
            <div id="media-player">
                <MediaPlayer listenMessage="Play" audioUrl={audioURL} />
            </div>
        </Card>
    </div>
);
