import LaunchIcon from '@mui/icons-material/Launch';
import ShopIcon from '@mui/icons-material/Shop';
import { Card, CardContent, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ScrollToDiv from '../../Widgets/ScrollButton/ScrollDiv';
import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import './Home.module.css';
import './Home.scss';

function App(): JSX.Element {
    return (
        <Typography className="page" component={'span'} variant={'body2'}>
            <div className="homeBackground">
                <ScrollToTop />
                <div className="topDiv">
                    <div className="backdrop">
                        <div className="title">
                            <div>
                                <b className="siteTitle">Tŝilhqot’in Ch’ih Yaltɨg</b>
                                <p className="heroTitle">We’re speaking the Tŝilhqot’in language</p>
                            </div>
                            <div>
                                <Link to={'/About'} id="top" className="dialect">
                                    Dialect
                                </Link>{' '}
                            </div>
                        </div>
                    </div>

                    <div className="bottomCenter">
                        <ScrollToDiv />
                    </div>
                </div>

                <div className="featuredSection">
                    <div>
                        <h1 id="featuredHeading">Featured</h1>
                    </div>
                    <Typography component={'span'} variant={'body2'} className="skillCard">
                        <Card sx={{ background: 'none' }} id="alphabet2" className="featured">
                            <Link to="/teachers" reloadDocument={true}>
                                <CardContent className="cardBlock"></CardContent>
                            </Link>
                        </Card>
                        <Card sx={{ background: 'none' }} id="phraseBook2" className="featured">
                            <Link to="/apps" reloadDocument={true}>
                                <CardContent className="cardBlock"></CardContent>
                            </Link>
                        </Card>

                        <a
                            href="https://play.google.com/store/apps/developer?id=Aaron+Plahn+%28Ts%CC%82ilhqot%E2%80%99in+National+Government%29"
                            id="phraseBook3"
                            className="featured"
                            target={'_blank'}
                            rel={'noopener noreferrer'}
                        >
                            <div id="featuredApps" className="cardBlock">
                                <div className="center">
                                    <div id="playstoreTag">
                                        Find us on the Playstore! <ShopIcon />
                                    </div>
                                    <div className="playStore">
                                        <img
                                            alt="logo"
                                            width="20"
                                            style={{
                                                paddingRight: '10px',
                                                verticalAlign: 'sub',
                                            }}
                                            src="https://api.tsilhqotinlanguage.ca/uploads/tng_log_for_language_hub_2e4ec30f17.png"
                                        />
                                        Tŝilhqot’in Language Apps {''}
                                        <LaunchIcon />
                                    </div>
                                </div>
                            </div>
                        </a>
                    </Typography>
                </div>
            </div>
        </Typography>
    );
}

export default App;
