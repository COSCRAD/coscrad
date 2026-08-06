import { buildDefaultRenderer } from './build-default-renderer';
import { CellRenderersMap } from './types';

export const renderCell = <T>(
    row: T,
    cellRendererMap: CellRenderersMap<T>,
    propertyToRender: keyof T
) => {
    const renderer = cellRendererMap.has(propertyToRender)
        ? cellRendererMap.get(propertyToRender)
        : buildDefaultRenderer(propertyToRender);

    return renderer(row);
};
