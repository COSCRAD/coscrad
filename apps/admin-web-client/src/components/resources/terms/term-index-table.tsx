import { useAuth0 } from '@auth0/auth0-react';
import { ITermViewModel, ResourceType } from '@coscrad/api-interfaces';
import {
    Box,
    TableContainer as MUITableContainer,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { NotFoundPresenter } from '../../not-found';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';
import { CellRenderer, CellRenderersMap, HeadingLabel } from '../../tables';
import {
    EmptyIndexTableException,
    UnnecessaryCellRendererDefinitionException,
} from '../../tables/generic-index-table-presenter/exceptions';
import { renderCell } from '../../tables/generic-index-table-presenter/render-cell';
import { CellRenderersDefinition } from '../../tables/generic-index-table-presenter/types/cell-renderers-definition';
import { CreateTermForm } from './create-term-form';

interface HasId {
    id: string;
}

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
    const { isAuthenticated } = useAuth0();

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

    const randomNumber = Math.floor(Math.random() * 100);

    /**
     * TODO Break the presentation part of this table out so that we can inject
     * instead a mobile list view, for example, without rewriting the filtering
     * and pagination logic.
     */
    const table =
        tableData.length === 0 ? (
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
                                {tableData.map((row, index) => (
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
                                            <TableCell
                                                key={`${String(propertyKey)}-${randomNumber}`}
                                            >
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
                    ></Box>
                </Paper>
            </Box>
        );

    return (
        <Stack>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h2">{heading}</Typography>
                <Box>
                    {isAuthenticated ? (
                        <PresentFormWithOptionalGeneratedId
                            form={CreateTermForm}
                            context={{
                                resourceType: ResourceType.term,
                                buttonLabel: 'CREATE TERM',
                            }}
                        />
                    ) : null}
                </Box>
            </Box>
            <Box>{table}</Box>
        </Stack>
    );
};
