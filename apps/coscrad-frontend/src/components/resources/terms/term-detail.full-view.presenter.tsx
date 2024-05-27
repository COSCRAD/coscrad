import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box } from '@mui/material';
import {
    ResourceDetailFullViewPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributions,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.term}
            contributions={[]}
        >
            <Box
                data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.term, id)}
            />
            <SingleOptionalPropertyPresenter display="Contributor" value={contributions} />
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
