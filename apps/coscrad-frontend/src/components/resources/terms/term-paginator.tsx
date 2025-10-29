import { ArrowForwardIos } from '@mui/icons-material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { FormControl, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { cyclicDecrement, cyclicIncrement } from '../../../utils/math';

export const DEFAULT_PAGE_SIZE = 5;

const pageSizeOptions: number[] = [DEFAULT_PAGE_SIZE, 10, 50, 100];

interface TermPaginatorProps {
    count: number;
    pageCount: number;
    pageSize: number;
    page: number;
    onPageSizeChange: (pageSize: number) => void;
    onPageNumberChange: (pageNumber: number) => void;
}

export const TermPaginator = ({
    count,
    pageCount,
    pageSize,
    page,
    onPageSizeChange,
    onPageNumberChange,
}: TermPaginatorProps): JSX.Element => {
    return (
        <Grid container justifyContent="flex-end" spacing={3}>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" sx={{ mr: 2, mt: 1 }}>
                    Total Records: {count} &nbsp; Filtered Records: {count}
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
                                typeof value === 'string' ? Number.parseInt(value) : value;

                            onPageSizeChange(newPageSize);
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
                Page: {page}/{pageCount}
            </Grid>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    onClick={() => {
                        onPageNumberChange(cyclicDecrement(page, pageCount));
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
            </Grid>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    onClick={() => {
                        onPageNumberChange(cyclicIncrement(page, pageCount));
                    }}
                >
                    <ArrowForwardIos />
                </IconButton>
            </Grid>
        </Grid>
    );
};
