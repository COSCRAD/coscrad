import { ICategorizableDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { MediaPlayer } from '../../../../../../libs/media-player/src';
import { DetailCard, DividerStyle } from '../../../styled-components';
import './term-detail.presenter.css';

// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailFullViewPresenter = ({
    id,
    term,
    termEnglish,
    audioURL,
    contributor,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => (
    <div className="term-detail-page" data-testid={id}>
        <DetailCard className="detail-card">
            <div id="detail-term">{term || ''}</div>
            <DividerStyle id="detail-divider" />
            <div className="detail-meta">
                <h3 className="detail-headers"> English: </h3>
                {termEnglish || ''}
            </div>

            <div className="detail-meta">
                <h3 className="detail-headers">Contributor: </h3>
                {contributor}
            </div>
            <div id="media-player">
                <MediaPlayer listenMessage="Play!" audioUrl={audioURL}></MediaPlayer>
            </div>
        </DetailCard>
    </div>
);
