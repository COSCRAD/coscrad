import { ICategorizableDetailQueryResult, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';

export const AudioPanel = ({
    url,
}: ICategorizableDetailQueryResult<IMediaItemViewModel>): JSX.Element => (
    <div>
        <MediaPlayer audioUrl={url} />
    </div>
);
