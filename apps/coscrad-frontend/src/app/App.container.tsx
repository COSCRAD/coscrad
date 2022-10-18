import { getConfigurableContent } from '../configurable-front-matter';
import App from './App';

export const AppContainer = (): JSX.Element => {
    /**
     * This will throw if the config file for configurable content is invalid.
     */
    const content = getConfigurableContent();

    return <App content={content}></App>;
};
