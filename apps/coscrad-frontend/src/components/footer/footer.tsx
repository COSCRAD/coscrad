import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { COSCRADByline } from '../coscrad-byline/coscrad-byline';
import { TenantLogo } from '../tenant-logo/tenant-logo';

export const Footer = (): JSX.Element => {
    const { copyrightHolder } = useContext(ConfigurableContentContext);

    return (
        <footer>
            {/* TODO: create date component so we have control over this for snapshots and tests */}
            &copy; {new Date().getFullYear()} {copyrightHolder}
            <TenantLogo />
            <br />
            <COSCRADByline />
        </footer>
    );
};