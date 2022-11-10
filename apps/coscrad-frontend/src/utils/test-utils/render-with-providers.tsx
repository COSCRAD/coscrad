import { PreloadedState } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { ConfigurableContentProvider } from '../../configurable-front-matter/configurable-content-provider';
import { ConfigurableContent } from '../../configurable-front-matter/data/configurableContentSchema';
import { AppStore, RootState, setupStore } from '../../store';
import { getDummyConfigurableContent } from './get-dummy-configurable-content';
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
    preloadedState?: PreloadedState<RootState>;
    store?: AppStore;
    route?: string;
    contentConfig?: ConfigurableContent;
}

/**
 * See these [docs](https://redux.js.org/usage/writing-tests)
 */
export const renderWithProviders = (
    ui: React.ReactElement,
    {
        preloadedState = {},
        store = setupStore(preloadedState),
        contentConfig = getDummyConfigurableContent(),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const Wrapper = ({ children }: PropsWithChildren<{}>): JSX.Element => (
        <Provider store={store}>
            <ConfigurableContentProvider value={contentConfig}>
                {children}
            </ConfigurableContentProvider>
        </Provider>
    );

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    };
};
