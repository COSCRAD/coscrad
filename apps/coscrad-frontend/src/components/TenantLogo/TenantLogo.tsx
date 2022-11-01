import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export const TenantLogo = (): JSX.Element => {
    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

    return (
        <div className="organization-logo">
            <img src={organizationLogoUrl} />
        </div>
    );
};
