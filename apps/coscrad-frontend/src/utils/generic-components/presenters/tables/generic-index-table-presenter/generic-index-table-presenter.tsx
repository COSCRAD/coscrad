import { IBaseViewModel } from '@coscrad/api-interfaces';
import './generic-index-table-presenter.css';
import { renderCell } from './render-cell';
import { CellRenderer, CellRenderersMap, HeadingLabel } from './types';
import { CellRenderersDefinition } from './types/cell-renderers-definition';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182694263]
 * Add ValueUnion to the types library.
 */
export type ValueUnion<T> = T[keyof T];

export interface GenericIndexTablePresenterProps<T extends IBaseViewModel> {
    headingLabels: HeadingLabel<T>[];
    tableData: T[];
    cellRenderersDefinition: CellRenderersDefinition<T>;
    heading: string;
}

/**
 * Possible Issues:
 * 1. We want to constrain the keys of renderers to a subset of the heading
 * labels' property keys. - This could lead to clients specifying unused renderers.
 * For now, we just do a check and throw.
 *
 * 2. We'll want a test of this, especially if we don't tighten up the types
 *
 * 3. We may want to require renderers for non-string (or maybe non-primitive types)
 *
 * 4. Can't we just call this `IndexTable` ? Having "Generic" in the name
 * seems unnecessary. Maybe `DefaultIndexTablePresenter` if we need the
 * extra nuance.
 */
export const GenericIndexTablePresenter = <T extends IBaseViewModel>({
    headingLabels,
    tableData,
    cellRenderersDefinition,
    heading,
}: GenericIndexTablePresenterProps<T>) => {
    const cellRenderers: CellRenderersMap<T> = new Map(
        Object.entries(cellRenderersDefinition) as [keyof T, CellRenderer<T>][]
    );

    /**
     * It's tricky to get type safety that forces cell renderers to only include
     * properties referenced in the heading labels. For now, we'll do a dynamic
     * check instead.
     */
    const cellRendererKeysNotInHeadings = headingLabels.reduce(
        (acc, { propertyKey }) =>
            propertyKey in cellRenderersDefinition ? acc : acc.concat(propertyKey),
        []
    );

    if (cellRendererKeysNotInHeadings.length > 0) {
        // TODO Custom exception class
        // TODO add a test for this
        throw new Error(
            `The following renderers are unnecessary, as the corresponding properties are not part of the heading definition: ${cellRendererKeysNotInHeadings}`
        );
    }

    return (
        <div>
            <h3>{heading}</h3>
            <div className="records-table">
                <div>
                    <table>
                        <thead>
                            <tr>
                                {headingLabels.map(({ headingLabel }) => (
                                    <th key={headingLabel}>{headingLabel}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row) => (
                                <tr key={row.id} data-testid={row.id}>
                                    {headingLabels.map(({ propertyKey }) => (
                                        // A little inversion of control here
                                        <td>{renderCell(row, cellRenderers, propertyKey)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
