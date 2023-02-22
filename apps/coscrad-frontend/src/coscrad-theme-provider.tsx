import { createTheme, ThemeProvider } from '@mui/material';
import { blue } from '@mui/material/colors';
import { ReactNode, useContext } from 'react';
import { ConfigurableContentContext } from './configurable-front-matter/configurable-content-provider';

interface CoscradThemeProviderProps {
    children: ReactNode;
}

export const CoscradThemeProvider = ({ children }: CoscradThemeProviderProps): JSX.Element => {
    const _configurableContent = useContext(ConfigurableContentContext);

    const coscradDefaultTheme = createTheme({
        palette: {
            primary: {
                main: blue[300],
            },
        },
    });

    return <ThemeProvider theme={coscradDefaultTheme}>{children}</ThemeProvider>;
};
