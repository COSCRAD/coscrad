import { ITermViewModel } from '@coscrad/api-interfaces';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
    Box,
    FormControl,
    Grid,
    IconButton,
    TableContainer as MUITableContainer,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
    CellRenderer,
    CellRenderersMap,
    HeadingLabel,
} from '../../../utils/generic-components/presenters/tables';
import {
    EmptyIndexTableException,
    UnnecessaryCellRendererDefinitionException,
} from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/exceptions';
import { renderCell } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/render-cell';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { cyclicDecrement, cyclicIncrement } from '../../../utils/math';
import { NotFoundPresenter } from '../../not-found';

interface HasId {
    id: string;
}

export const DEFAULT_PAGE_SIZE = 5;

const pageSizeOptions: number[] = [DEFAULT_PAGE_SIZE, 10, 50, 100];

const calculateNumberOfPages = (numberOfRecords: number, pageSize: number) => {
    const quotient = Math.floor(numberOfRecords / pageSize);

    const remainder = numberOfRecords % pageSize;

    return remainder === 0 ? quotient : quotient + 1;
};

/**
 * TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-341]
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
export interface GenericIndexTablePresenterProps<T> {
    // AggregateType- we only use this to build data-testid attributes so we can easily query in tests
    type: string;
    headingLabels: HeadingLabel<T>[];
    tableData: T[];
    cellRenderersDefinition: CellRenderersDefinition<T>;
    heading: string;
}

/**
 * Note that our previous generic `IndexTable` worked well until we pushed
 * pagination and filtering to the back-end. We have duplicated and modified
 * its logic so we can achieve active search for terms without breaking
 * the other resource views, which currently use the legacy experience.
 */
export const TermIndexTable = ({
    type,
    headingLabels,
    tableData,
    cellRenderersDefinition,
    heading,
}: GenericIndexTablePresenterProps<ITermViewModel>) => {
    if (headingLabels.length === 0) {
        throw new EmptyIndexTableException();
    }

    // PAGINATION
    // we index pages starting at 0
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

    const lastPageIndex = calculateNumberOfPages(tableData.length, pageSize) - 1;

    useEffect(() => {
        if (currentPageIndex > lastPageIndex) setCurrentPageIndex(0);
    }, [lastPageIndex, currentPageIndex]);

    const startIndex = currentPageIndex * pageSize;
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
            propertiesInTable.includes(rendererPropertyKey as unknown as keyof ITermViewModel)
                ? acc
                : acc.concat(rendererPropertyKey),
        []
    );

    if (cellRendererKeysNotInHeadings.length > 0) {
        throw new UnnecessaryCellRendererDefinitionException(cellRendererKeysNotInHeadings);
    }

    const cellRenderers: CellRenderersMap<ITermViewModel> = new Map(
        Object.entries(cellRenderersDefinition) as [
            keyof ITermViewModel,
            CellRenderer<ITermViewModel>
        ][]
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
            <Box sx={{ width: '100%' }}>
                <Paper>
                    <MUITableContainer>
                        <Table aria-labelledby="Resources Table" color="primary">
                            <TableHead>
                                <TableRow>
                                    {headingLabels.map(({ headingLabel }) => (
                                        <TableCell sx={{ fontWeight: 'bold' }} key={headingLabel}>
                                            {headingLabel}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedData.map((row, index) => (
                                    // TODO find a better fallback key
                                    <TableRow
                                        key={(row as HasId).id || index}
                                        data-testid={
                                            (row as HasId).id
                                                ? `${type}/${(row as HasId).id}`
                                                : index
                                        }
                                    >
                                        {headingLabels.map(({ propertyKey }) => (
                                            // A little inversion of control here
                                            // We may want to use some currying here
                                            <TableCell key={String(propertyKey)}>
                                                {renderCell(row, cellRenderers, propertyKey)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </MUITableContainer>
                    <Box
                        component="div"
                        sx={{
                            display: 'grid',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyItems: 'flex-end',
                        }}
                    >
                        <Grid container justifyContent="flex-end" spacing={3}>
                            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography component="span" sx={{ mr: 2, mt: 1 }}>
                                    Total Records: {tableData.length} &nbsp; Filtered Records:{' '}
                                    {tableData.length}
                                </Typography>
                            </Grid>
                            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography component="span" sx={{ mr: 2 }}>
                                    Rows per page:
                                </Typography>
                                <FormControl variant="standard" sx={{ m: 1 }}>
                                    <Select
                                        name="pageSize"
                                        value={pageSize}
                                        onChange={(changeEvent) => {
                                            const {
                                                target: { value },
                                            } = changeEvent;

                                            const newPageSize =
                                                typeof value === 'string'
                                                    ? Number.parseInt(value)
                                                    : value;

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
                            </Grid>
                            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                Page: {currentPageIndex + 1}/{lastPageIndex + 1}
                            </Grid>
                            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    onClick={() =>
                                        setCurrentPageIndex(
                                            cyclicDecrement(currentPageIndex, lastPageIndex + 1)
                                        )
                                    }
                                >
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                            </Grid>
                            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    onClick={() =>
                                        setCurrentPageIndex(
                                            cyclicIncrement(currentPageIndex, lastPageIndex + 1)
                                        )
                                    }
                                >
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        );

    return (
        <Stack>
            <Typography variant="h2">{heading}</Typography>
            <Box>{table}</Box>
        </Stack>
    );
};
