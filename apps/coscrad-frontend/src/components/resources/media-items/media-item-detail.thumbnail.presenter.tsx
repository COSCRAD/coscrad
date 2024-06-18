import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IMediaItemViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';

export const MediaItemDetailThumbnailPresenter = ({
    id,
    name,
    url,
    lengthMilliseconds,
}: ICategorizableDetailQueryResult<IMediaItemViewModel>): JSX.Element => {
    return (
        <div
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.mediaItem, id)}
        >
            <Card className="detail-card">
                <div id="detail-term" className="detail-meta">
                    <MultilingualTextPresenter text={name} resourceType={ResourceType.mediaItem} />
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
