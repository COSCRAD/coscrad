import { CellRenderer } from './cell-renderer';

export type CellRenderersDefinition<T> = {
    [K in keyof T]?: CellRenderer<T>;
};
