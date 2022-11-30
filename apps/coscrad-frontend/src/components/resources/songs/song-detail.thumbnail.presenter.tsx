import { IDetailQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { MediaPlayer } from '../../../../../../libs/media-player/src';
import { formatBilingualText } from '../vocabulary-lists/utils';

export const SongDetailThumbnailPresenter = ({
    data: { title, titleEnglish, contributions, lyrics, audioURL },
}: IDetailQueryResult<ISongViewModel>): JSX.Element => (
    <div data-testid={title}>
        <Card className="term-detail-card">
            <div id="term-detail-term" className="term-detail-meta">
                {formatBilingualText(title, titleEnglish)}
            </div>
            <Divider id="term-detail-divider" />

            <div className="term-detail-meta">
                <h3 className="term-detail-headers">Contributions:</h3>
                TODO use config for this
            </div>
            <div className="term-detail-meta">
                <h3 className="term-detail-headers">Lyrics:</h3>
                {lyrics || 'Coming soon'}
            </div>
            <div id="term-media-player">
                <MediaPlayer listenMessage="Play" audioUrl={audioURL} />
            </div>
        </Card>
        {/* TODO handle audio playback for lists */}
        {/* <div>URL:{audioURL}</div> */}
    </div>
);
