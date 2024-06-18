import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ISongViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';
import { Optional } from '../../../utils/generic-components/presenters/optional';

export const SongDetailFullViewPresenter = ({
    id,
    name,
    lyrics,
    audioURL,
    contributions,
}: ICategorizableDetailQueryResult<ISongViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.song, id)}
            name={name}
            id={id}
            type={ResourceType.song}
            contributions={contributions}
        >
            <Optional predicateValue={lyrics}>
                <MultilingualTextPresenter text={lyrics} resourceType={ResourceType.song} />
            </Optional>
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
