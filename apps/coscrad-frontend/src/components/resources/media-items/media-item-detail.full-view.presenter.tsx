import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IMediaItemViewModel,
} from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { formatBilingualText } from '../vocabulary-lists/utils';

export const MediaItemDetailFullViewPresenter = ({
    id,
    title,
    titleEnglish,
    url,
}: ICategorizableDetailQueryResult<IMediaItemViewModel>): JSX.Element => {
    return (
        <div
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.mediaItem, id)}
        >
            <Card className="detail-card">
                <div id="detail-term" className="detail-meta">
                    {formatBilingualText(title, titleEnglish)}
                </div>
                <Divider id="detail-divider" />

                <video className="video-player" controls>
                    <source src={url} type="video/webm" />
                    <source src={url} type="video/mp4" />
                </video>
            </Card>
        </div>
    );
};
