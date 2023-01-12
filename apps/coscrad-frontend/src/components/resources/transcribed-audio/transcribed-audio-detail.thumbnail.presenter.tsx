import {
    ICategorizableDetailQueryResult,
    ITranscribedAudioViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Card, CardContent, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../utils/generic-components';
import { convertMillisecondsToSeconds } from '../utils/math/';
import styles from './transcribed-audio-detail.thumbnail.presenter.module.scss';

export const TranscribedAudioDetailThumbnailPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
}: ICategorizableDetailQueryResult<ITranscribedAudioViewModel>): JSX.Element => (
    <Card>
        <CardContent>
            <div className={styles['preview']}>
                <MediaPlayer audioUrl={audioURL} />
            </div>
            <div className={styles['meta']} title="View Connected Transcribed Audio">
                <SinglePropertyPresenter display="Transcribed Audio ID" value={id} />
                <SinglePropertyPresenter
                    display="Duration"
                    value={convertMillisecondsToSeconds(lengthMilliseconds)}
                />
            </div>
            <div className={styles['resource-nav-link']}>
                <Link to={`/${routes.resources.ofType(ResourceType.transcribedAudio).detail(id)}`}>
                    <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Link>
            </div>
            <FloatSpacerDiv />
        </CardContent>
    </Card>
);
