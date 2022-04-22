import { Typography } from '@mui/material';
import './Home.module.css';

function App() {
    return (
        <Typography>
            <div className="topDiv">
                <div className="title" style={{ marginTop: '55vh', position: 'absolute' }}>
                    <div style={{ paddingBottom: '1vw' }}>
                        <b>Tŝilhqot’in Ch’ih Yaltɨg</b>
                        <p className="heroTitle">We’re speaking the Tŝilhqot’in language</p>
                    </div>
                    <div className="dialect">Dialect</div>
                </div>
            </div>
            <div className="midDiv"></div>
            <div className="bottomDiv"></div>
        </Typography>
    );
}

export default App;
