import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../utils/generic-components';
import { convertMillisecondsToSeconds } from '../utils/math';
import './audio-item-detail.thumbnail.presenter.css';

export const AudioItemDetailThumbnailPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => (
    <div className="detail-thumbnail-container">
        <Link to={`/${routes.resources.ofType(ResourceType.audioItem).detail(id)}`}>
            <div
                className="detail-thumbnail-meta-container"
                title="View Connected Transcribed Audio"
            >
                <SinglePropertyPresenter display="Transcribed Audio ID" value={id} />
                <SinglePropertyPresenter
                    display="Duration"
                    value={convertMillisecondsToSeconds(lengthMilliseconds)}
                />
            </div>
        </Link>
        <div className="detail-thumbnail-media-container">
            <MediaPlayer audioUrl={audioURL} />
        </div>
        <FloatSpacerDiv />
    </div>
);
