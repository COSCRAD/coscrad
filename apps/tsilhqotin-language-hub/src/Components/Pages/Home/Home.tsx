import { Typography } from '@mui/material';
import './Home.module.css';

function App() {
    return (
        <Typography component={'span'} variant={'body2'}>
            <div
                style={{
                    backgroundColor: 'rgba(7, 7, 7, 0.377)',
                }}
            ></div>
            <div
                style={{
                    backgroundColor: 'rgba(7, 7, 7, 0.377)',
                    height: '100vh',
                }}
                className="Home"
            >
                <div className="topDiv">
                    <div className="title">
                        <div style={{ paddingBottom: '1vw' }}>
                            <b>Tŝilhqot’in Ch’ih Yaltɨg</b>
                            <p className="heroTitle">We’re speaking the Tŝilhqot’in language</p>
                        </div>
                        <div id="top" className="dialect">
                            Dialect
                        </div>
                    </div>
                </div>
                <div id="mid" className="midDiv"></div>
                <div id="bottom" className="bottomDiv"></div>
            </div>
        </Typography>
    );
}

export default App;
