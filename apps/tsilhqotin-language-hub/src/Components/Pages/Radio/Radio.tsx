import RadioIcon from '@mui/icons-material/Radio';
import { Card } from '@mui/material';
import { MediaPlayer } from '../../../../../../libs/media-player/src';
import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';

export function Radio() {
    return (
        <div className="page">
            <ScrollToTop />
            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Radio</h1>
                </div>
            </div>
            <div id="aboutContent" className="pageContent">
                <h2>
                    Tŝilhqot’in Radio 104.5 FM <RadioIcon />
                </h2>
                <Card className="tsilhqotinRadio">
                    <img
                        width={100}
                        alt="radioLogo"
                        src="https://www.tsilhqotin.ca/wp-content/uploads/2022/11/tsilhqotin_radio-removebg-preview-5.png"
                    />
                    <div className="radioPlayer">
                        <MediaPlayer />
                    </div>
                </Card>

                <p>
                    We are an Indigenous broadcasting group supporting revitalization and
                    restoration of Tŝilhqot’in language and culture while building on the need to
                    discuss relevant indigenous issues on a shareable platform to thousands across
                    the country. As the Tŝilhqot’in Nation won Aboriginal Title in the Supreme Court
                    of Canada- a first in Canadian history- we broadcast important discussions
                    relevant to First Nations, Inuit and Metis across Canada.
                </p>
            </div>
        </div>
    );
}

export default Radio;
