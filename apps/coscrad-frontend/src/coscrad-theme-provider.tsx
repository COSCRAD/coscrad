import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { blue } from '@mui/material/colors';
import { ReactNode, useContext } from 'react';
import { ConfigurableContentContext } from './configurable-front-matter/configurable-content-provider';

/**
 * The below types need to be added for creating a custom setting like a font size in theme
 */

declare module '@mui/material/styles' {
    interface TypographyVariants {
        small: React.CSSProperties;
        smaller: React.CSSProperties;
        smallest: React.CSSProperties;
    }

    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
        small?: React.CSSProperties;
        smaller?: React.CSSProperties;
        smallest?: React.CSSProperties;
    }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        small: true;
        smaller: true;
        smallest: true;
    }
}

interface CoscradThemeProviderProps {
    children: ReactNode;
}

export const CoscradThemeProvider = ({ children }: CoscradThemeProviderProps): JSX.Element => {
    const _configurableContent = useContext(ConfigurableContentContext);

    const coscradDefaultTheme = responsiveFontSizes(
        createTheme({
            palette: {
                primary: {
                    main: blue[800],
                },
            },
            typography: {
                small: {
                    fontSize: 14,
                },
                smaller: {
                    fontSize: 11,
                },
                smallest: {
                    fontSize: 9,
                },
            },
        })
    );

    return <ThemeProvider theme={coscradDefaultTheme}>{children}</ThemeProvider>;
};
