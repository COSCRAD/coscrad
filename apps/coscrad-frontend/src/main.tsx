import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './app/create-app-router';
import { getConfigurableContent } from './configurable-front-matter';
import { ConfigurableContentProvider } from './configurable-front-matter/configurable-content-provider';
import { CoscradThemeProvider } from './coscrad-theme-provider';
import { setupStore } from './store';

const contentConfig = getConfigurableContent();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const store = setupStore();

/**
 * Here we patch window to expose the store within Cypress.
 */

//@ts-expect-error TODO extend window type
window.store = store;

root.render(
    <StrictMode>
        <Provider store={setupStore()}>
            {/* The following will throw (fail fast) if the content config is invalid */}
            <ConfigurableContentProvider value={contentConfig}>
                <CoscradThemeProvider>
                    <RouterProvider router={createAppRouter(contentConfig)} />
                </CoscradThemeProvider>
            </ConfigurableContentProvider>
        </Provider>
    </StrictMode>
);
