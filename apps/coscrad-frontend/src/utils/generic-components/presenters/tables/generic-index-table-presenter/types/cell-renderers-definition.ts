import { HasId } from '@coscrad/api-interfaces';
import { CellRenderer } from './cell-renderer';

export type CellRenderersDefinition<T extends HasId> = {
    [K in keyof T]?: CellRenderer<T>;
};
