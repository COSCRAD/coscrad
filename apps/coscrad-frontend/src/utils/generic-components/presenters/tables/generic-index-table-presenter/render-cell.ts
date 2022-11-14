import { IBaseViewModel } from '@coscrad/api-interfaces';
import { buildDefaultRenderer } from './build-default-renderer';
import { CellRenderersMap } from './types';

export const renderCell = <T extends IBaseViewModel>(
    row: T,
    cellRendererMap: CellRenderersMap<T>,
    propertyToRender: keyof T
) => {
    const renderer = cellRendererMap.has(propertyToRender)
        ? cellRendererMap.get(propertyToRender)
        : buildDefaultRenderer(propertyToRender);

    return renderer(row);
};
