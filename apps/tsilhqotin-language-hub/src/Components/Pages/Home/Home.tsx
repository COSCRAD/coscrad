import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import './Home.module.css';

function App() {
    return (
        <Typography className="page" component={'span'} variant={'body2'}>
            <div className="Home">
                <div className="topDiv">
                    <div className="backdrop">
                        <div className="title">
                            <div style={{ paddingBottom: '18px' }}>
                                <b>Tŝilhqot’in Ch’ih Yaltɨg</b>
                                <p className="heroTitle">We’re speaking the Tŝilhqot’in language</p>
                            </div>
                            <Link to={'/About'} id="top" className="dialect">
                                Dialect
                            </Link>
                        </div>
                    </div>
                </div>
                {/*
                                <div id="mid" className="midDiv"></div>
                <div id="bottom" className="bottomDiv"></div>
                
                */}
            </div>
        </Typography>
    );
}

export default App;
