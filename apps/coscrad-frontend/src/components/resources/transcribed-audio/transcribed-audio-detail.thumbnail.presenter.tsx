import {
    ICategorizableDetailQueryResult,
    ITranscribedAudioViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Card, CardContent } from '@mui/material';
import { routes } from '../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceNavLink } from '../shared/resource-nav-link';
import { convertMillisecondsToSeconds } from '../utils/math/';
import styles from './transcribed-audio-detail.thumbnail.presenter.module.scss';

export const TranscribedAudioDetailThumbnailPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
}: ICategorizableDetailQueryResult<ITranscribedAudioViewModel>): JSX.Element => (
    <Card>
        <CardContent>
            <div data-testid={id} className={styles['preview']}>
                <MediaPlayer audioUrl={audioURL} />
            </div>
            <div className={styles['meta']}>
                <SinglePropertyPresenter display="Transcribed Audio ID" value={id} />
                <SinglePropertyPresenter
                    display="Duration"
                    value={convertMillisecondsToSeconds(lengthMilliseconds)}
                />
            </div>
            <div className={styles['resource-nav-link']}>
                <ResourceNavLink
                    linkURL={`/${routes.resources
                        .ofType(ResourceType.transcribedAudio)
                        .detail(id)}`}
                />
            </div>
            <FloatSpacerDiv />
        </CardContent>
    </Card>
);
