import { IBaseViewModel } from '@coscrad/api-interfaces';
import { useEffect, useState } from 'react';
import { EmptyIndexTableException, UnnecessaryCellRendererDefinitionException } from './exceptions';
import './generic-index-table-presenter.css';
import { renderCell } from './render-cell';
import { CellRenderer, CellRenderersMap, HeadingLabel } from './types';
import { CellRenderersDefinition } from './types/cell-renderers-definition';

const calculateNumberOfPages = (numberOfRecords: number, pageSize: number) => {
    const quotient = Math.floor(numberOfRecords / pageSize);

    const remainder = numberOfRecords % pageSize;

    return remainder === 0 ? quotient : quotient + 1;
};

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

    // SEARCH LOGIC

    if (headingLabels.length === 0) {
        throw new EmptyIndexTableException();
    }

    const [searchValue, setSearchValue] = useState('');

    const filteredTableData = tableData.filter((row) =>
        Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchValue.toLowerCase())
        )
    );

    // PAGINATION

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        const lastPage = calculateNumberOfPages(filteredTableData.length, pageSize);

        if (currentPage > lastPage) setCurrentPage(1);
    }, []);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = tableData.slice(startIndex, endIndex);

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
            <input
                placeholder="Search ..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
            />
            <div className="records-table">
                <div>
                    <div className="pagination-buttons">
                        <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                        <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                {headingLabels.map(({ headingLabel }) => (
                                    <th key={headingLabel}>{headingLabel}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row) => (
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
