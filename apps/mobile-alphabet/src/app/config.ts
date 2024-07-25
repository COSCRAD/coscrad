import { createContext, useContext } from 'react';
import Config from 'react-native-config';

export interface ConfigStore {
    config: Config;
}

export type EnvKeys = 'BASE_API_URL' | 'TARGET_ALPHABET_NAME';

export interface Config {
    env: {
        [k in EnvKeys]: string;
    };
}

export const initialConfig: ConfigStore = {
    config: {
        env: {
            BASE_API_URL: Config.BASE_API_URL,
            TARGET_ALPHABET_NAME: Config.TARGET_ALPHABET_NAME,
        },
    },
};

export const setUpConfig = async (overrides: Partial<ConfigStore> = {}): Promise<ConfigStore> => {
    return Promise.resolve({ ...initialConfig, ...overrides });
};

export const RootStoreContext = createContext<ConfigStore>(initialConfig);

export const RootStoreProvider = RootStoreContext.Provider;

export const useConfig = () => useContext(RootStoreContext).config;
