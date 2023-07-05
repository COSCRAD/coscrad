import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ISongViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';
import { Optional } from '../../../utils/generic-components/presenters/optional';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';
import { CreditsHack } from './credits-hack';

export const SongDetailFullViewPresenter = ({
    id,
    name,
    lyrics,
    audioURL,
}: ICategorizableDetailQueryResult<ISongViewModel> & ContextProps): JSX.Element => {
    const { songIdToCredits } = useContext(ConfigurableContentContext);

    const creditsMap = new Map<string, string>(
        Object.entries(songIdToCredits as Record<string, string>)
    );

    return (
        <ResourceDetailFullViewPresenter
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.song, id)}
            name={name}
            id={id}
            type={ResourceType.song}
        >
            <Optional predicateValue={lyrics}>
                <MultilingualTextPresenter text={lyrics} />
            </Optional>
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>

            <Box className="detail-meta">
                <CreditsHack resourceId={id} creditsMap={creditsMap} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
