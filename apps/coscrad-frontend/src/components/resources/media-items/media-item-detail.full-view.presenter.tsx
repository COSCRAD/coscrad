import { ICategorizableDetailQueryResult, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { formatBilingualText } from '../vocabulary-lists/utils';
import { ContributionsHack } from './contributors-hack';

export const MediaItemDetailFullViewPresenter = ({
    id,
    title,
    titleEnglish,
    url,
}: ICategorizableDetailQueryResult<IMediaItemViewModel>): JSX.Element => {
    const { videoIdToCredits } = useContext(ConfigurableContentContext);

    const contributionsMap = new Map<string, string>(
        Object.entries(videoIdToCredits as Record<string, string>)
    );

    return (
        <div data-testid={id}>
            <Card className="detail-card">
                <div id="detail-term" className="detail-meta">
                    {formatBilingualText(title, titleEnglish)}
                </div>
                <Divider id="detail-divider" />

                <video className="video-player" controls>
                    <source src={url} type="video/webm" />
                    <source src={url} type="video/mp4" />
                </video>

                <div className="detail-meta">
                    <ContributionsHack resourceId={id} contributionsMap={contributionsMap} />
                </div>
            </Card>
        </div>
    );
};
