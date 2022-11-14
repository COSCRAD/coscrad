import { IBaseViewModel } from '@coscrad/api-interfaces';
import { CellRenderer } from './cell-renderer';

export type CellRenderersMap<T extends IBaseViewModel> = Map<keyof T, CellRenderer<T>>;
