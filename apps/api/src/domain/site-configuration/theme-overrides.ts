import { HexColorCode, NestedDataType, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { DTO } from '../../types/DTO';

export class TypeText {
    @HexColorCode({
        label: 'primary',
        description: 'the hex color code for primary text',
    })
    primary: string;

    @HexColorCode({
        label: 'secondary',
        description: 'the hex color code for secondary text',
    })
    secondary: string;

    @HexColorCode({
        label: 'disabled',
        description: 'the hex color code for disabled text',
    })
    disabled: string;
}

export class TypeAction {
    // We might want an @Colour or @HexColourCode
    // do we support named colours or just hex? rgb?
    // We need to validate that these are indeed legit colour codes
    // should this be stored as a `CustomColour` class?
    @HexColorCode({
        label: 'active',
        description: 'the hex color code for active',
    })
    active: string;

    @HexColorCode({
        label: 'hover',
        description: 'the hex color code for hover',
    })
    hover: string;
    // @ Percentage // decimal between 0 and 1
    @NonNegativeFiniteNumber({
        label: 'hover opacity',
        description: 'the hover opacity',
    })
    hoverOpacity: number;

    @HexColorCode({
        label: 'selected',
        description: 'the hex color code for selected',
    })
    selected: string;

    @NonNegativeFiniteNumber({
        label: 'selected opacity',
        description: 'the selected opacity',
    })
    selectedOpacity: number;

    @HexColorCode({
        label: 'disabled',
        description: 'the hex color code for disabled',
    })
    disabled: string;

    @NonNegativeFiniteNumber({
        label: 'disabled opacity',
        description: 'the disabled opacity',
    })
    disabledOpacity: number;

    @HexColorCode({
        label: 'disabled background',
        description: 'the hex color code for disabled background',
    })
    disabledBackground: string;

    @HexColorCode({
        label: 'focus',
        description: 'the hex color code for focus',
    })
    focus: string;

    @NonNegativeFiniteNumber({
        label: 'focus opacity',
        description: 'the focus opacity',
    })
    focusOpacity: number;

    @NonNegativeFiniteNumber({
        label: 'activated opacity',
        description: 'the activated opacity',
    })
    activatedOpacity: number;
}

// export interface SimplePaletteColorOptions {
export class PaletteColorOptions {
    @HexColorCode({
        label: 'light',
        description: 'the hex color code for light',
        isOptional: true,
    })
    light?: string;

    @HexColorCode({
        label: 'main',
        description: 'the hex color code for main',
    })
    main: string;

    @HexColorCode({
        label: 'dark',
        description: 'the hex color code for dark',
        isOptional: true,
    })
    dark?: string;

    @HexColorCode({
        label: 'contrast text',
        description: 'the contrast text',
        isOptional: true,
    })
    contrastText?: string;
}

export class TypeBackground {
    @HexColorCode({
        label: 'default',
        description: 'the hex color code for default',
    })
    default: string;

    @HexColorCode({
        label: 'paper',
        description: 'the hex color code for paper',
    })
    paper: string;
}

export class PaletteOptions {
    @NestedDataType(PaletteColorOptions, {
        label: 'primary',
        description: 'the primary color palette',
        isOptional: true,
    })
    primary?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'secondary',
        description: 'the secondary color palette',
        isOptional: true,
    })
    secondary?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'error',
        description: 'the error color palette',
        isOptional: true,
    })
    error?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'warning',
        description: 'the warning color palette',
        isOptional: true,
    })
    warning?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'info',
        description: 'the info color palette',
        isOptional: true,
    })
    info?: PaletteColorOptions;

    @NestedDataType(PaletteColorOptions, {
        label: 'success',
        description: 'the success color palette',
        isOptional: true,
    })
    success?: PaletteColorOptions;

    @NonNegativeFiniteNumber({
        label: 'contrast threshold',
        description: 'the contrast threshold',
        isOptional: true,
    })
    contrastThreshold?: number;

    @NestedDataType(TypeAction, {
        label: 'text',
        description: 'the text color palette',
        isOptional: true,
    })
    text?: Partial<TypeText>;

    @HexColorCode({
        label: 'divider',
        description: 'the divider color',
        isOptional: true,
    })
    divider?: string;

    @NestedDataType(TypeAction, {
        label: 'action',
        description: 'the action color palette',
        isOptional: true,
    })
    action?: Partial<TypeAction>;

    @NestedDataType(TypeBackground, {
        label: 'background',
        description: 'the background color palette',
        isOptional: true,
    })
    background?: Partial<TypeBackground>;
}

export class ThemeOverrides {
    @NestedDataType(PaletteOptions, {
        label: 'palette',
        description: 'MUI style palette configuration',
    })
    palette: PaletteOptions;

    constructor(dto: DTO<ThemeOverrides>) {
        if (!dto) return;

        const { palette } = dto;

        this.palette = palette;
    }
}
