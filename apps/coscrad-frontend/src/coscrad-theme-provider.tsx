import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { ReactNode, useContext } from 'react';
import { ConfigurableContentContext } from './configurable-front-matter/configurable-content-provider';

interface CoscradThemeProviderProps {
    children: ReactNode;
}

declare module '@mui/material/styles' {
    interface BreakpointOverrides {
        qhd: true;
        uhd: true;
    }
}

export const CoscradThemeProvider = ({ children }: CoscradThemeProviderProps): JSX.Element => {
    const { themeOverrides } = useContext(ConfigurableContentContext);

    const coscradDefaultTheme = responsiveFontSizes(
        createTheme({
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 900,
                    lg: 1200,
                    xl: 1536,
                    qhd: 2560 /* QHD resolution 2560 x 1440 */,
                    uhd: 3840 /* UHD resolution 3840 by 2160 */,
                },
            },
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
                h6: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: '4px',
                },
                body1: {
                    lineHeight: '1.1',
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
