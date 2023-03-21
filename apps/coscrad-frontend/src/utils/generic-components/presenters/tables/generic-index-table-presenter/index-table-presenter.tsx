import { IBaseViewModel } from '@coscrad/api-interfaces';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FormControl, MenuItem, Paper, Select, Typography } from '@mui/material';
import { NotFoundPresenter } from '../../../../../components/not-found';
import { cyclicDecrement, cyclicIncrement } from '../../../../math';
import { renderCell } from './render-cell';
import { CellRenderersMap, HeadingLabel } from './types';

interface IndexTablePresenterProps<T extends IBaseViewModel> {
    headingLabels: HeadingLabel<T>[];
    paginatedData: T[];
    cellRenderers: CellRenderersMap<T>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    pageSizeOptions: number[];
    currentPageIndex: number;
    setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
    lastPageIndex: number;
}

export const IndexTablePresenter = <T extends IBaseViewModel>({
    cellRenderers,
    headingLabels,
    paginatedData,
    pageSize,
    setPageSize,
    currentPageIndex,
    setCurrentPageIndex,
    pageSizeOptions,
    lastPageIndex,
}: IndexTablePresenterProps<T>): JSX.Element => {
    return (
        <>
            {paginatedData.length === 0 ? (
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
                    <Typography component={'span'}>
                        <Paper className="index-footer">
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
                            Page: {currentPageIndex + 1}/{lastPageIndex + 1}
                            <ArrowBackIosIcon
                                id="pagination-back-arrow"
                                className="pagination-arrow"
                                onClick={() =>
                                    setCurrentPageIndex(
                                        cyclicDecrement(currentPageIndex, lastPageIndex + 1)
                                    )
                                }
                            >
                                Prev
                            </ArrowBackIosIcon>
                            <ArrowForwardIosIcon
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
                            </ArrowForwardIosIcon>
                        </Paper>
                    </Typography>
                </div>
            )}
        </>
    );
};
