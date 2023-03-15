import { ICategorizableDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Card, Divider } from '@mui/material';

type HasTermOfTheDay = {
    termOfTheDay: any
}

export const TermOfTheDayPresenter = ({ termOfTheDay }: HasTermOfTheDay, {
    id,
    term,
    termEnglish,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {

    const today: Date = new Date();
    const year: number = today.getFullYear();
    const month: number = today.getMonth() + 1;
    const day: number = today.getDate();

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const monthName = monthNames[month - 1];

    return (
        <div data-testid={id}>
            <Card className="detail-card">
                <div>TERM OF THE DAY </div>
                {/* <div id="detail-term">{term || ''}</div> */}
                <Divider id="detail-divider" />
                <div className="detail-meta">
                    <h3 className="detail-headers"> English: </h3>
                    {/* {termEnglish || ''} */}
                </div>
                <div className="detail-meta">
                    <h3 className="detail-headers">Contributor: </h3>
                    {/* {contributor} */}
                </div>

                <div id="media-player">
                    <MediaPlayer listenMessage="Play!" audioUrl={audioURL} />
                </div>
                <div>{monthName} {day}, {year}</div>
            </Card>
        </div>
    );
};