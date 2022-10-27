import coscradLogo from '../../assets/coscrad-logo.png';
import './COSCRADLogo.css';

export const COSCRADLogo = (): JSX.Element => {
    return (
        <span className="coscrad-logo">
            <img src={coscradLogo} />
        </span>
    );
};
