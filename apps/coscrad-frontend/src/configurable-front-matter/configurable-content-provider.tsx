import { createContext, FC as FunctionalComponent, ReactNode } from 'react';
import { ConfigurableContent } from './data/configurable-content-schema';

export const ConfigurableContentContext = createContext<ConfigurableContent>(null);

type ContentProviderProps = {
    children: ReactNode;
    value: ConfigurableContent;
};

export const ConfigurableContentProvider: FunctionalComponent<ContentProviderProps> = ({
    children,
    value,
}: ContentProviderProps) => {
    return (
        <ConfigurableContentContext.Provider value={value}>
            {children}
        </ConfigurableContentContext.Provider>
    );
};
