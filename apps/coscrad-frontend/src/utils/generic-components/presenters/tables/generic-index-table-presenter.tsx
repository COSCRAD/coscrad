import { IBaseViewModel } from '@coscrad/api-interfaces';
import './generic-index-table-presenter.css';

// TODO add me to the types library
export type ValueUnion<T> = T[keyof T];

export type Renderer<T> = (row: T) => JSX.Element | string;

export type CellRenderers<T extends IBaseViewModel> = Map<keyof T, Renderer<T>>;

export type HeadingLabel<T extends IBaseViewModel> = {
    propertyKey: keyof T;
    headingLabel: string;
};

const buildDefaultRenderer =
    <T extends IBaseViewModel>(propertyKey: keyof T) =>
    (input: T) =>
        <div>{JSON.stringify(input[propertyKey]).replace(/"/g, '')}</div>;

export interface GenericIndexTablePresenterProps<T extends IBaseViewModel> {
    headingLabels: HeadingLabel<T>[];
    tableData: T[];
    cellRenderers: CellRenderers<T>;
}

const renderCell = <T extends IBaseViewModel>(
    row: T,
    cellRenderers: CellRenderers<T>,
    propertyToRender: keyof T
) => {
    const renderer = cellRenderers.has(propertyToRender)
        ? cellRenderers.get(propertyToRender)
        : buildDefaultRenderer(propertyToRender);

    return renderer(row);
};

/**
 * Possible Issues:
 * 1. We want to constrain the keys of renderers to a subset of the heading
 * labels' property keys. - This could lead to clients specifying unused renderers.
 *
 * 2. We'll want a test of this, especially if we don't tighten up the types
 *
 * 3. We may want to require renderers for non-string (or maybe non-primitive types)
 */
export const GenericIndexTablePresenter = <T extends IBaseViewModel>({
    headingLabels,
    tableData,
    cellRenderers,
}: GenericIndexTablePresenterProps<T>) => {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        {headingLabels.map(({ headingLabel }) => (
                            <th>{headingLabel}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row) => (
                        <tr key={row.id}>
                            {headingLabels.map(({ propertyKey }) => (
                                // A little inversion of control here
                                <td>{renderCell(row, cellRenderers, propertyKey)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
