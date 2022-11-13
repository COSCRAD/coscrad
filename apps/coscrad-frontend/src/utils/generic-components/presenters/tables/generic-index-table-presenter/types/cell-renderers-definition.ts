import { IBaseViewModel } from '@coscrad/api-interfaces';
import { CellRenderer } from './cell-renderer';

export type CellRenderersDefinition<T extends IBaseViewModel> = {
    [K in keyof T]?: CellRenderer<T>;
};
