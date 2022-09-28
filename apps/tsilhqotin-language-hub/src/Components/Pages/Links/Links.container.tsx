import { getGlobalConfig } from '../../../Configs/global.config';
import { LinksPresenter } from './Links.presenter';

/**
 * We need to have a separate FundersContainer that reads the config
 * and FundersPresenter that just takes in the data from the config and
 * flows it into JSX.
 */
export function LinksContainer() {
    // TODO create a config provider
    const { linkInfos } = getGlobalConfig();

    return <LinksPresenter linkInfos={linkInfos}></LinksPresenter>;
}
