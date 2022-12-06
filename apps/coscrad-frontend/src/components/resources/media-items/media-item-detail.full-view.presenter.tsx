import { IDetailQueryResult, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { formatBilingualText } from '../vocabulary-lists/utils';

export const MediaItemDetailFullViewPresenter = ({
    data: { id, title, titleEnglish, contributions, url },
}: IDetailQueryResult<IMediaItemViewModel>): JSX.Element => {
    const { videoIdToCredits } = useContext(ConfigurableContentContext);

    const creditsMap = new Map<string, string>(
        Object.entries(videoIdToCredits as Record<string, string>)
    );

    return (
        <div data-testid={id}>
            <Card className="detail-card">
                <div id="detail-term" className="detail-meta">
                    {formatBilingualText(title, titleEnglish)}
                </div>
                <Divider id="detail-divider" />
                <div className="detail-meta">
                    <h3 className="detail-headers">Contributions:</h3>
                    TODO use config for this
                </div>
                <div className="detail-meta">{url}</div>
            </Card>
        </div>
    );
};
