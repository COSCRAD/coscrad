import { NestedDataType } from '@coscrad/data-types';
import { PaletteOptions, ThemeOptions } from '@mui/material';
import { RecordObject } from './record-object';

export type MUIThemeOverrides = Pick<ThemeOptions, 'palette'>;

export class ThemeOverrides implements MUIThemeOverrides {
    @NestedDataType(RecordObject, {
        label: 'palette',
        description: 'MUI style palette configuration',
    })
    palette: PaletteOptions;
}
