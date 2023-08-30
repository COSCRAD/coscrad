import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { VideoPrototypePlayer } from '@coscrad/media-player';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailFullViewPresenter = ({
    lengthMilliseconds,
    transcript,
    name,
    id,
    videoUrl,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => {
    const { items } = transcript;

    /**
     * Simulation of the subtitle model for the basic user view of the video player
     */
    const subtitles = items.map(
        ({ inPointMilliseconds, outPointMilliseconds, text, speakerInitials }) => {
            const { items } = text;

            const textVersions = items.map(({ languageCode, text }) => {
                return {
                    languageCode: languageCode,
                    text: text,
                };
            });

            return {
                inPointMilliseconds: inPointMilliseconds,
                outPointMilliseconds: outPointMilliseconds,
                textVersions: textVersions,
                speakerInitials,
            };
        }
    );

    const timeUpdateHandler = (currentTime) => {
        console.log({ currentTime });
    };

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.video}>
            <SinglePropertyPresenter
                display="Duration"
                value={`${convertMillisecondsToSeconds(lengthMilliseconds)} Sec`}
            />
            <VideoPrototypePlayer
                videoUrl={videoUrl}
                subtitles={subtitles}
                onTimeUpdateHandler={timeUpdateHandler}
            />
        </ResourceDetailFullViewPresenter>
    );
};
