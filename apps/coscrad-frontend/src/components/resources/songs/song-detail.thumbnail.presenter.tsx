import { IDetailQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Card, Divider } from '@mui/material';
import { formatBilingualText } from '../vocabulary-lists/utils';

const buildLyricsStatusMessage = (lyrics: string | null | undefined): string =>
    lyrics === null || typeof lyrics === 'undefined'
        ? 'No Lyrics Available'
        : 'Lyrics are available for this song';

export const SongDetailThumbnailPresenter = ({
    data: { title, titleEnglish, lyrics, audioURL },
}: IDetailQueryResult<ISongViewModel>): JSX.Element => (
    <div data-testid={title}>
        <Card className="detail-card">
            <div id="detail-term" className="detail-meta">
                {formatBilingualText(title, titleEnglish)}
            </div>
            <Divider id="detail-divider" />

            <div className="detail-meta">{buildLyricsStatusMessage(lyrics)}</div>
            <div id="media-player">
                <MediaPlayer listenMessage="Play" audioUrl={audioURL} />
            </div>
        </Card>
        {/* TODO handle audio playback for lists */}
        {/* <div>URL:{audioURL}</div> */}
    </div>
);
