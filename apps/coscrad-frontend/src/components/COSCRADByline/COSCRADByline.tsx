import { COSCRADLogo } from '../COSCRADLogo/COSCRADLogo';
import './COSCRADByline.css';

export const COSCRADByline = (): JSX.Element => {
    return (
        <span className="coscrad-byline">
            A project built on the <COSCRADLogo /> platform.
        </span>
    );
};
