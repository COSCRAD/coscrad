import { COSCRADLogo } from '../coscrad-logo/coscrad-logo';
import './coscrad-byline.css';

export const COSCRADByline = (): JSX.Element => {
    return (
        <span className="coscrad-byline">
            A project built on the <COSCRADLogo /> platform.
        </span>
    );
};
