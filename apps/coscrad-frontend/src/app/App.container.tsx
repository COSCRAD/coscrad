import getFrontMatter from '../configurable-front-matter/getFrontMatter';
import App from './App.presenter';

export const AppContainer = (): JSX.Element => {
    /**
     * This will throw if the config file for configurable content is invalid.
     */
    const content = getFrontMatter();

    return <App content={content}></App>;
};
