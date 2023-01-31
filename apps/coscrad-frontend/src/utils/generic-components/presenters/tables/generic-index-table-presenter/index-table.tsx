import { IBaseViewModel } from '@coscrad/api-interfaces';
import { useTheme } from '@emotion/react';
import { FormControl, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { NotFoundPresenter } from '../../../../../components/not-found';
import { BackArrowIcon, ForwardArrowIcon } from '../../../../../emotion-components/buttons';
import { cyclicDecrement, cyclicIncrement } from '../../../../math';
import { EmptyIndexTableException, UnnecessaryCellRendererDefinitionException } from './exceptions';
import './generic-index-table-presenter.css';
import './index-table.css';
import { renderCell } from './render-cell';
import { CellRenderer, CellRenderersMap, HeadingLabel } from './types';
import { CellRenderersDefinition } from './types/cell-renderers-definition';

export const DEFAULT_PAGE_SIZE = 5;

const pageSizeOptions: number[] = [DEFAULT_PAGE_SIZE, 10, 50, 100];

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
    filterableProperties: (keyof T)[];
}

export const IndexTable = <T extends IBaseViewModel>({
    headingLabels,
    tableData,
    cellRenderersDefinition,
    heading,
    filterableProperties,
}: GenericIndexTablePresenterProps<T>) => {
    const theme = useTheme();

    if (headingLabels.length === 0) {
        throw new EmptyIndexTableException();
    }

    const [searchValue, setSearchValue] = useState('');

    // SEARCH LOGIC
    const filteredTableData =
        searchValue.length === 0
            ? tableData
            : tableData.filter((row) =>
                  filterableProperties.some((propertyKey) =>
                      String(row[propertyKey]).toLowerCase().includes(searchValue.toLowerCase())
                  )
              );

    // PAGINATION
    // we index pages starting at 0
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

    const lastPageIndex = calculateNumberOfPages(filteredTableData.length, pageSize) - 1;

    useEffect(() => {
        if (currentPageIndex > lastPageIndex) setCurrentPageIndex(0);
    }, [lastPageIndex, currentPageIndex]);

    const startIndex = currentPageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredTableData.slice(startIndex, endIndex);

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

    /**
     * TODO Break the presentation part of this table out so that we can inject
     * instead a mobile list view, for example, without rewriting the filtering
     * and pagination logic.
     */
    const table =
        paginatedData.length === 0 ? (
            <NotFoundPresenter />
        ) : (
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
                <div>
                    <footer className="index-footer">
                        <span> </span> Rows per page:
                        <FormControl sx={{ m: 1, width: 60 }} size="small">
                            <Select
                                sx={{ notchedOutline: 'none' }}
                                className="pagination-control"
                                name="pageSize"
                                value={pageSize}
                                onChange={(changeEvent) => {
                                    const {
                                        target: { value },
                                    } = changeEvent;

                                    const newPageSize =
                                        typeof value === 'string' ? Number.parseInt(value) : value;

                                    setPageSize(newPageSize);
                                }}
                            >
                                {pageSizeOptions.map((pageSize) => (
                                    <MenuItem key={pageSize} value={pageSize}>
                                        {pageSize}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        Page: {currentPageIndex + 1}/{lastPageIndex + 1}
                        <BackArrowIcon
                            id="pagination-back-arrow"
                            className="pagination-arrow"
                            onClick={() =>
                                setCurrentPageIndex(
                                    cyclicDecrement(currentPageIndex, lastPageIndex + 1)
                                )
                            }
                        >
                            Prev
                        </BackArrowIcon>
                        <ForwardArrowIcon
                            id="pagination-front-arrow"
                            className="pagination-arrow"
                            style={{ verticalAlign: 'sub' }}
                            onClick={() =>
                                setCurrentPageIndex(
                                    cyclicIncrement(currentPageIndex, lastPageIndex + 1)
                                )
                            }
                        >
                            Next
                        </ForwardArrowIcon>
                    </footer>
                </div>
            </div>
        );

    return (
        <div>
            <h3>{heading}</h3>
            <TextField
                style={{ padding: '0 0 5px 0' }}
                size="small"
                placeholder="Search ..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
            />
            <div className="records-table">{table}</div>
        </div>
    );
};
