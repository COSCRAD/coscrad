import { ICategorizableDetailQueryResult, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';
import { formatBilingualText } from '../vocabulary-lists/utils';

export const MediaItemDetailThumbnailPresenter = ({
    id,
    title,
    titleEnglish,
    url,
    lengthMilliseconds,
}: ICategorizableDetailQueryResult<IMediaItemViewModel> & ContextProps): JSX.Element => {
    return (
        <div data-testid={id}>
            <Card className="detail-card">
                <div id="detail-term" className="detail-meta">
                    {formatBilingualText(title, titleEnglish)}
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
