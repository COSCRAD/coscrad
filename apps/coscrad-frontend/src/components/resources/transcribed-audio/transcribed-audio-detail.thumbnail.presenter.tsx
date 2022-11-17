import {
    IDetailQueryResult,
    ITranscribedAudioViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { FloatSpacerDiv } from 'apps/coscrad-frontend/src/utils/generic-components';
import { SinglePropertyPresenter } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/single-property-presenter';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { convertMillisecondsToSeconds } from '../utils/math/';
import './transcribed-audio-detail.thumbnail.presenter.css';

export const TranscribedAudioDetailThumbnailPresenter = ({
    data: { id, lengthMilliseconds, audioURL },
}: IDetailQueryResult<ITranscribedAudioViewModel>): JSX.Element => (
    <div className="detail-thumbnail-container">
        <Link to={`/${routes.resources.ofType(ResourceType.transcribedAudio).detail(id)}`}>
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
