import { CellRenderer } from './cell-renderer';

export type CellRenderersMap<T> = Map<keyof T, CellRenderer<T>>;
