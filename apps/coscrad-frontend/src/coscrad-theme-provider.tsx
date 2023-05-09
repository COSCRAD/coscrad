import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { ReactNode, useContext } from 'react';
import { ConfigurableContentContext } from './configurable-front-matter/configurable-content-provider';

interface CoscradThemeProviderProps {
    children: ReactNode;
}

export const CoscradThemeProvider = ({ children }: CoscradThemeProviderProps): JSX.Element => {
    const { themeOverrides } = useContext(ConfigurableContentContext);

    const coscradDefaultTheme = responsiveFontSizes(
        createTheme({
            typography: {
                h1: {
                    fontSize: 40,
                },
                h2: {
                    fontSize: 35,
                    fontWeight: 'bold',
                    marginBottom: '33px',
                },
                h3: {
                    fontSize: 26,
                    fontWeight: 'bold',
                    marginBottom: '28px',
                },
                h4: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: '12px',
                },
                h5: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: '7px',
                },
            },
            components: {
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            fontSize: 16,
                        },
                    },
                },
            },
            ...themeOverrides,
        })
    );

    return <ThemeProvider theme={coscradDefaultTheme}>{children}</ThemeProvider>;
};
