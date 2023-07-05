import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IMediaItemViewModel,
} from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';

export const MediaItemDetailThumbnailPresenter = ({
    id,
    name,
    url,
    lengthMilliseconds,
}: ICategorizableDetailQueryResult<IMediaItemViewModel> & ContextProps): JSX.Element => {
    return (
        <div
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.mediaItem, id)}
        >
            <Card className="detail-card">
                <div id="detail-term" className="detail-meta">
                    <MultilingualTextPresenter text={name} />
                </div>
                <Divider id="detail-divider" />
                <div className="detail-meta">
                    <h3>Length:</h3>
                    {renderMediaLengthInSeconds(lengthMilliseconds)}
                </div>
                <div className="detail-meta">{url}</div>
            </Card>
        </div>
    );
};
