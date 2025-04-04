import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IMediaItemViewModel,
    MIMEType,
} from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { formatBilingualText } from '../vocabulary-lists/utils';

export const MediaItemDetailFullViewPresenter = ({
    id,
    title,
    titleEnglish,
    url,
    mimeType,
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
                {[MIMEType.png, MIMEType.jpg, MIMEType.bmp, MIMEType.svg].includes(mimeType) ? (
                    // TODO How do we handle making this responsive?
                    <img src={url} alt={title} height={300} />
                ) : (
                    <video className="video-player" controls>
                        <source src={url} type="video/webm" />
                        <source src={url} type="video/mp4" />
                    </video>
                )}
            </Card>
        </div>
    );
};
