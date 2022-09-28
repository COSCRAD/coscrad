import { getGlobalConfig } from '../../../Configs/global.config';
import { FundersPresenter } from './Funders.presenter';

/**
 * We need to have a separate FundersContainer that reads the config
 * and FundersPresenter that just takes in the data from the config and
 * flows it into JSX.
 */
export function FundersContainer() {
    // TODO create a config provider
    const { funderInfos } = getGlobalConfig();

    return <FundersPresenter funderInfos={funderInfos}></FundersPresenter>;
}
