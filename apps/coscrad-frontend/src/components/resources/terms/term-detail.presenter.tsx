import { IDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { Card, Divider } from '@mui/material';
import { MediaPlayer } from '../../../../../../libs/media-player/src';
import './term-detail.presenter.css';

// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailPresenter = ({
    data: { term, termEnglish, audioURL, contributor },
}: IDetailQueryResult<ITermViewModel>): JSX.Element => (
    <div className="term-detail-page">
        <Card className="term-detail-card">
            <div id="term-detail-term">{term || ''}</div>
            <Divider id="term-detail-divider" />
            <div className="term-detail-meta">
                <h3 className="term-detail-headers"> English: </h3>
                {termEnglish || ''}
            </div>

            <div className="term-detail-meta">
                <h3 className="term-detail-headers">Contributor: </h3>
                {contributor}
            </div>

            <div id="term-media-player">
                <MediaPlayer listenMessage="Play!" audioUrl={audioURL} />
            </div>
        </Card>
    </div>
);
