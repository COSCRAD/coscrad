import { NestedDataType } from '@coscrad/data-types';

export class TypeText {
    primary: string;
    secondary: string;
    disabled: string;
}

export class TypeAction {
    // We might want an @Colour or @HexColourCode
    // do we support named colours or just hex? rgb?
    // We need to validate that these are indeed legit colour codes
    // should this be stored as a `CustomColour` class?
    active: string;
    hover: string;
    // @ Percentage // decimal between 0 and 1
    hoverOpacity: number;
    selected: string;
    selectedOpacity: number;
    disabled: string;
    disabledOpacity: number;
    disabledBackground: string;
    focus: string;
    focusOpacity: number;
    activatedOpacity: number;
}

// export interface SimplePaletteColorOptions {
export class PaletteColorOptions {
    light?: string;
    main: string;
    dark?: string;
    contrastText?: string;
}

export interface TypeBackground {
    default: string;
    paper: string;
}

export class PaletteOptions {
    primary?: PaletteColorOptions;
    secondary?: PaletteColorOptions;
    error?: PaletteColorOptions;
    warning?: PaletteColorOptions;
    info?: PaletteColorOptions;
    success?: PaletteColorOptions;
    contrastThreshold?: number;
    text?: Partial<TypeText>;
    divider?: string;
    action?: Partial<TypeAction>;
    background?: Partial<TypeBackground>;
}

export class ThemeOverrides {
    @NestedDataType(PaletteOptions, {
        label: 'palette',
        description: 'MUI style palette configuration',
    })
    palette: PaletteOptions;
}
