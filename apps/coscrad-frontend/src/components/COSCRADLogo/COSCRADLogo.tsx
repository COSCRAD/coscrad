// We're importing this asset so that if it is not present it will break the build
import coscradLogo from '../../assets/coscrad-logo.png';
import './COSCRADLogo.css';

export const COSCRADLogo = (): JSX.Element => {
    return (
        <span className="coscrad-logo">
            <img src={coscradLogo} alt={'COSCRAD Logo'} />
        </span>
    );
};
