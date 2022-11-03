import RadioIcon from '@mui/icons-material/Radio';
import { Card } from '@mui/material';
import { MediaPlayer } from '../../../../../../libs/media-player/src';
import { getRadioConfig } from '../../../Configs/Radio/radio.config';
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
                    Tŝilhqot’in Radio <RadioIcon />
                </h2>
                <Card className="tsilhqotinRadio">
                    <img width={120} alt="radioLogo" src={getRadioConfig().radioLogoUrl} />
                    <div className="radioPlayer">
                        <MediaPlayer audioUrl={getRadioConfig().radioAudioUrl} />
                    </div>
                </Card>

                <p>{getRadioConfig().radioMissionStatement}</p>
            </div>
        </div>
    );
}

export default Radio;
