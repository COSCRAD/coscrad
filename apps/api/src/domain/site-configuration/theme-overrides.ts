import {
    HexColorCode,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
} from '@coscrad/data-types';

export class TypeText {
    @NonEmptyString({
        label: 'primary',
        description: 'primary',
    })
    primary: string;

    @NonEmptyString({
        label: 'secondary',
        description: 'secondary',
    })
    secondary: string;

    @NonEmptyString({
        label: 'disabled',
        description: 'disabled',
    })
    disabled: string;
}

export class TypeAction {
    // We might want an @Colour or @HexColourCode
    // do we support named colours or just hex? rgb?
    // We need to validate that these are indeed legit colour codes
    // should this be stored as a `CustomColour` class?
    @HexColorCode({
        label: 'disabled',
        description: 'disabled',
    })
    active: string;

    @HexColorCode({
        label: 'disabled',
        description: 'disabled',
    })
    hover: string;
    // @ Percentage // decimal between 0 and 1
    @NonNegativeFiniteNumber({
        label: 'hover opacity',
        description: 'hover opacity',
    })
    hoverOpacity: number;

    @HexColorCode({
        label: 'disabled',
        description: 'disabled',
    })
    selected: string;

    @NonNegativeFiniteNumber({
        label: 'selected opacity',
        description: 'selected opacity',
    })
    selectedOpacity: number;

    @HexColorCode({
        label: 'disabled',
        description: 'disabled',
    })
    disabled: string;

    @NonNegativeFiniteNumber({
        label: 'disabled opacity',
        description: 'disabled opacity',
    })
    disabledOpacity: number;

    @HexColorCode({
        label: 'disabled',
        description: 'disabled',
    })
    disabledBackground: string;

    @HexColorCode({
        label: 'disabled',
        description: 'disabled',
    })
    focus: string;

    @NonNegativeFiniteNumber({
        label: 'focus opacity',
        description: 'focus opacity',
    })
    focusOpacity: number;

    @NonNegativeFiniteNumber({
        label: 'activated opacity',
        description: 'activated opacity',
    })
    activatedOpacity: number;
}

// export interface SimplePaletteColorOptions {
export class PaletteColorOptions {
    @HexColorCode({
        label: 'light',
        description: 'light',
    })
    light?: string;

    @HexColorCode({
        label: 'main',
        description: 'main',
    })
    main: string;

    @HexColorCode({
        label: 'dark',
        description: 'dark',
    })
    dark?: string;

    @HexColorCode({
        label: 'contrast text',
        description: 'contrast text',
    })
    contrastText?: string;
}

export class TypeBackground {
    @HexColorCode({
        label: 'default',
        description: 'default color code',
    })
    default: string;

    @HexColorCode({
        label: 'paper',
        description: 'paper color code',
    })
    paper: string;
}

export class PaletteOptions {
    @NestedDataType(PaletteColorOptions, {
        label: 'primary',
        description: 'primary color palette',
    })
    primary?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'secondary',
        description: 'secondary color palette',
    })
    secondary?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'error',
        description: 'error color palette',
    })
    error?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'warning',
        description: 'warning color palette',
    })
    warning?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'info',
        description: 'info color palette',
    })
    info?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'success',
        description: 'success color palette',
    })
    success?: PaletteColorOptions;

    @NonNegativeFiniteNumber({
        label: 'contrast threshold',
        description: 'contrast threshold',
    })
    contrastThreshold?: number;

    text?: Partial<TypeText>;

    @HexColorCode({
        label: 'divider',
        description: 'divider color',
    })
    divider?: string;

    @NestedDataType(TypeAction, {
        label: 'action',
        description: 'action color palette',
    })
    action?: Partial<TypeAction>;

    @NestedDataType(TypeBackground, {
        label: 'background',
        description: 'background color palette',
    })
    background?: Partial<TypeBackground>;
}

export class ThemeOverrides {
    @NestedDataType(PaletteOptions, {
        label: 'palette',
        description: 'MUI style palette configuration',
    })
    palette: PaletteOptions;
}
