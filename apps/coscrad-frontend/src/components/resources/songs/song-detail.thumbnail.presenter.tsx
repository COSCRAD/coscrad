import { ICategorizableDetailQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Card, Divider } from '@mui/material';
import { formatBilingualText } from '../vocabulary-lists/utils';

const buildLyricsStatusMessage = (lyrics: string | null | undefined): string =>
    isNullOrUndefined(lyrics) ? 'No Lyrics Available' : 'Lyrics are available for this song';

export const SongDetailThumbnailPresenter = ({
    title,
    titleEnglish,
    lyrics,
    audioURL,
}: ICategorizableDetailQueryResult<ISongViewModel>): JSX.Element => (
    <div data-testid={title}>
        <Card className="detail-card">
            <div id="detail-term" className="detail-meta">
                {formatBilingualText(title, titleEnglish)}
            </div>
            <Divider id="detail-divider" />

            <div className="detail-meta">{buildLyricsStatusMessage(lyrics)}</div>
            <div id="media-player">
                <MediaPlayer audioUrl={audioURL} />
            </div>
        </Card>
        {/* TODO handle audio playback for lists */}
        {/* <div>URL:{audioURL}</div> */}
    </div>
);
