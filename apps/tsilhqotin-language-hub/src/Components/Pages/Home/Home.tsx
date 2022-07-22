import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ScrollToDiv from '../../Widgets/ScrollButton/ScrollDiv';
import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import './Home.module.css';

function App(): JSX.Element {
    return (
        <Typography className="page" component={'span'} variant={'body2'}>
            <div className="Home">
                <ScrollToTop />

                <div className="topDiv">
                    <div className="backdrop">
                        <div className="title">
                            <div style={{ paddingBottom: '18px' }}>
                                <b>Tŝilhqot’in Ch’ih Yaltɨg</b>
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

                <section className="flex-container">
                    <div className="flex-child1">Cell Phone Image</div>

                    <div className="flex-child2">
                        <div style={{ width: '60%', textAlign: 'center' }}>
                            <h1 className="download">DOWNLOAD</h1>
                            <h2 className="downloadApp">Tsilhqot'in Digital Phrasebook</h2>
                            <br />
                            <p>
                                The Tsilhqot'in Digital Phrasebook contains over 10,000 Tsilhqot'in
                                terms and 1,000 Paradigms/Vocabulary Lists
                            </p>
                            <br />
                            <Button className="button" variant="outlined">
                                APP STORE
                            </Button>
                            <Button className="button" variant="outlined">
                                PLAY STORE
                            </Button>
                        </div>
                    </div>
                </section>
                <section className="flex-container">hi</section>
            </div>
        </Typography>
    );
}

export default App;
