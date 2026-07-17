import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { ReactNode } from 'react';

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
                fontFamily: ['Helvetica', 'Roboto', 'Arial', 'sans-serif'].join(','),
                h1: {
                    fontSize: 40,
                },
                h2: {
                    fontSize: 35,
                    fontWeight: 'bold',
                    marginBottom: '8px',
                },
                h3: {
                    fontSize: 26,
                    fontWeight: 'bold',
                    marginBottom: '6px',
                },
                h4: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginBottom: '4px',
                },
                h5: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: '3px',
                },
                h6: {
                    fontSize: 13,
                    fontWeight: 'bold',
                    marginBottom: '2px',
                },
                body1: {
                    lineHeight: '1.6',
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
                MuiLink: {
                    defaultProps: {
                        underline: 'none',
                    },
                },
            },
            palette: {
                mode: 'dark',
                primary: {
                    light: '#FF7B6E',
                    main: '#6ab9ae',
                    dark: '#A40011',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    light: '#000000',
                    main: '#000000',
                    dark: '#000000',
                    contrastText: '#FFFFFF',
                },
                text: {
                    primary: '#212121',
                    secondary: '#757575',
                    disabled: '#BDBDBD',
                },
                background: {
                    paper: '#F5F5F5',
                },
                action: {
                    hover: '#5ca49a33',
                    active: '#A40011',
                    hoverOpacity: 0.08,
                    selected: '#E0E0E0',
                    selectedOpacity: 0.16,
                    disabled: '#BDBDBD',
                    disabledBackground: '#E0E0E0',
                    disabledOpacity: 0.38,
                    focus: '#FFFF00',
                    focusOpacity: 0.12,
                    activatedOpacity: 0.24,
                },
            },
        })
    );

    return <ThemeProvider theme={coscradDefaultTheme}>{children}</ThemeProvider>;
};
