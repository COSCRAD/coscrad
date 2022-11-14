import { IBaseViewModel } from '@coscrad/api-interfaces';
import { EmptyIndexTableException, UnnecessaryCellRendererDefinitionException } from './exceptions';
import './generic-index-table-presenter.css';
import { renderCell } from './render-cell';
import { CellRenderer, CellRenderersMap, HeadingLabel } from './types';
import { CellRenderersDefinition } from './types/cell-renderers-definition';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182694263]
 * Add ValueUnion to the types library.
 */
export type ValueUnion<T> = T[keyof T];

/**
 * We want to constrain the keys of renderers to a subset of the heading
 * labels' property keys. - This could lead to clients specifying unused renderers.
 * For now, we just do a check and throw.
 *
 * We may also want to require renderers for non-string (or maybe non-primitive types)
 */
export interface GenericIndexTablePresenterProps<T extends IBaseViewModel> {
    headingLabels: HeadingLabel<T>[];
    tableData: T[];
    cellRenderersDefinition: CellRenderersDefinition<T>;
    heading: string;
}

export const IndexTable = <T extends IBaseViewModel>({
    headingLabels,
    tableData,
    cellRenderersDefinition,
    heading,
}: GenericIndexTablePresenterProps<T>) => {
    if (headingLabels.length === 0) {
        throw new EmptyIndexTableException();
    }

    /**
     * It's tricky to get type safety that forces cell renderers to only include
     * properties referenced in the heading labels. For now, we'll do a dynamic
     * check instead.
     */
    const propertiesInTable = headingLabels.map(({ propertyKey }) => propertyKey);

    const cellRendererKeysNotInHeadings = Object.keys(cellRenderersDefinition).reduce(
        (acc: string[], rendererPropertyKey) =>
            // @ts-expect-error We need to tell the compiler the keys of IBaseViewModel  must be strings
            propertiesInTable.includes(rendererPropertyKey) ? acc : acc.concat(rendererPropertyKey),
        []
    );

    if (cellRendererKeysNotInHeadings.length > 0) {
        throw new UnnecessaryCellRendererDefinitionException(cellRendererKeysNotInHeadings);
    }

    const cellRenderers: CellRenderersMap<T> = new Map(
        Object.entries(cellRenderersDefinition) as [keyof T, CellRenderer<T>][]
    );

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
                                        // We may want to use some currying here
                                        <td key={String(propertyKey)}>
                                            {renderCell(row, cellRenderers, propertyKey)}
                                        </td>
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
