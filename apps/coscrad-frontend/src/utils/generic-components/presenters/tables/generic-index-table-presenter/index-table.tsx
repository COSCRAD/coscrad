import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
    Box,
    Checkbox,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer as MUITableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { NotFoundPresenter } from '../../../../../components/not-found';
import { ConfigurableContentContext } from '../../../../../configurable-front-matter/configurable-content-provider';
import { cyclicDecrement, cyclicIncrement } from '../../../../math';
import { EmptyIndexTableException, UnnecessaryCellRendererDefinitionException } from './exceptions';
import { filterTableData, Matchers } from './filter-table-data';
import { renderCell } from './render-cell';
import { SearchBar } from './search-bar';
import { CellRenderer, CellRenderersMap, HeadingLabel } from './types';
import { CellRenderersDefinition } from './types/cell-renderers-definition';

interface HasId {
    id: string;
}

export const DEFAULT_PAGE_SIZE = 5;

const pageSizeOptions: number[] = [DEFAULT_PAGE_SIZE, 10, 50, 100];

const labelForSearchAllPropertiesOption = 'ALL';

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
export interface GenericIndexTablePresenterProps<T> {
    headingLabels: HeadingLabel<T>[];
    tableData: T[];
    cellRenderersDefinition: CellRenderersDefinition<T>;
    heading: string;
    filterableProperties: (keyof T)[];
    matchers?: Matchers<T>;
}

const allProperties = 'allProperties';

export const IndexTable = <T,>({
    headingLabels,
    tableData,
    cellRenderersDefinition,
    heading,
    filterableProperties,
    matchers = {}, // default to String(value) & case-insensitive search
}: GenericIndexTablePresenterProps<T>) => {
    if (headingLabels.length === 0) {
        throw new EmptyIndexTableException();
    }

    // TODO [] Encapsulte this as part of the `SearchBar`.
    const { simulatedKeyboard } = useContext(ConfigurableContentContext);

    const [searchValue, setSearchValue] = useState('');

    // SEARCH LOGIC
    const [selectedFilterProperty, setSelectedFilterProperty] = useState<
        typeof allProperties | keyof T
    >(allProperties);

    const [shouldUseVirtualKeyboard, _setShouldUseVirtualKeyboard] = useState<boolean>(true);

    const propertiesToFilterBy =
        selectedFilterProperty === 'allProperties'
            ? filterableProperties
            : [selectedFilterProperty];

    const filteredTableData = filterTableData(
        tableData,
        propertiesToFilterBy,
        searchValue,
        matchers
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
            <Box sx={{ width: '100%' }}>
                <Paper>
                    <MUITableContainer>
                        <Table aria-labelledby="Resources Table">
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
                                        data-testid={(row as HasId).id || index}
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
                                    <ArrowBackIosIcon />
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

    const propertiesToSearchSelectField = (
        <FormControl sx={{ minWidth: 120 }} size={'small'}>
            <InputLabel>Filter</InputLabel>
            <Select
                label={'Filter'}
                value={selectedFilterProperty}
                onChange={(changeEvent) => {
                    const {
                        target: { value },
                    } = changeEvent;
                    setSelectedFilterProperty(value as keyof T);
                }}
            >
                <MenuItem sx={{ minWidth: 120 }} value={'allProperties'}>
                    {labelForSearchAllPropertiesOption}
                </MenuItem>
                {filterableProperties.map((selectedFilterProperty: keyof T & string) => (
                    <MenuItem
                        key={selectedFilterProperty}
                        value={selectedFilterProperty}
                        sx={{ minWidth: 120 }}
                    >
                        {
                            headingLabels.find(
                                ({ propertyKey: labelPropertyKey }) =>
                                    labelPropertyKey === selectedFilterProperty
                            )?.headingLabel
                        }
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    return (
        <Stack>
            <Typography variant="h2">{heading}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {propertiesToSearchSelectField}

                <SearchBar
                    value={searchValue}
                    onValueChange={setSearchValue}
                    specialCharacterReplacements={
                        shouldUseVirtualKeyboard
                            ? simulatedKeyboard?.specialCharacterReplacements
                            : undefined
                    }
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Checkbox
                    checked={shouldUseVirtualKeyboard}
                    onChange={() => _setShouldUseVirtualKeyboard(!shouldUseVirtualKeyboard)}
                />

                {!isNullOrUndefined(simulatedKeyboard) && shouldUseVirtualKeyboard ? (
                    <p>Special Character Input Method: {simulatedKeyboard.name}</p>
                ) : (
                    <p>Click to enable input method: {simulatedKeyboard.name}</p>
                )}
            </Box>

            <Box>{table}</Box>
        </Stack>
    );
};
