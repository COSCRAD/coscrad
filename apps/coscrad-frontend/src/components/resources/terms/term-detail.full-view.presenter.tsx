import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined, isString } from '@coscrad/validation-constraints';
import { Box, Typography } from '@mui/material';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { ResourceNamePresenterProps } from '../../../utils/generic-components/presenters/detail-views/resource-detail-presenter-header';
import { ExpandableMultilingualTextPresenter } from '../../../utils/generic-components/presenters/expandable-multilingual-text-presenter';

const TermNamePresenter = ({ name, variant }: ResourceNamePresenterProps): JSX.Element => {
    return (
        <Typography
            gutterBottom
            component="span"
            variant={variant}
            fontWeight="bold"
            color="primary"
        >
            {isString(name) || isNullOrUndefined(name) ? (
                name
            ) : (
                // Should we inject the multilingual text presenter instead?
                <ExpandableMultilingualTextPresenter text={name} />
            )}
        </Typography>
    );
};

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
            contributions={contributions}
            NamePresenter={TermNamePresenter}
        >
            <Box
                data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.term, id)}
            />
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
