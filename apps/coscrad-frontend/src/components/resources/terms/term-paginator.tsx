import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FormControl, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { useAppDispatch } from '../../../app/hooks';
import {
    changePageSizeForTerms,
    fetchTerms,
    useLoadableTerms,
} from '../../../store/slices/resources';
import { cyclicDecrement, cyclicIncrement } from '../../../utils/math';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';

// TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-344] make this configurable
export const DEFAULT_PAGE_SIZE = 5;

const pageSizeOptions: number[] = [DEFAULT_PAGE_SIZE, 10, 50, 100];

export const TermPaginator = (): JSX.Element => {
    const dispatch = useAppDispatch();

    const { data, isLoading, errorInfo, pageSize } = useLoadableTerms();

    if (errorInfo) {
        return <ErrorDisplay {...errorInfo} />;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!data?.selected) {
        return <Loading />;
    }

    const { count, page, selected = [] } = data;

    const pageCount = Math.ceil(count / pageSize);

    const startingRecordNumberHumanReadable = pageSize * (page - 1) + 1;

    const endingRecordNumberHumanReadable =
        startingRecordNumberHumanReadable + (selected?.length || 0) - 1;

    const totalNumberOfPages = Math.ceil(count / pageSize);

    return (
        <Grid container justifyContent="flex-end" spacing={3}>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" sx={{ mr: 2, mt: 1 }}>
                    Showing Records: {startingRecordNumberHumanReadable}-
                    {endingRecordNumberHumanReadable}/{count} &nbsp; Filtered Records: {count}
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

                            dispatch(
                                changePageSizeForTerms({
                                    pageSize: newPageSize,
                                })
                            );
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
                        dispatch(
                            fetchTerms({
                                pagination: {
                                    size: pageSize,
                                    page: cyclicDecrement(page - 1, totalNumberOfPages) + 1,
                                },
                            })
                        );
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
            </Grid>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    onClick={() => {
                        dispatch(
                            fetchTerms({
                                pagination: {
                                    size: pageSize,
                                    page: cyclicIncrement(page - 1, totalNumberOfPages) + 1,
                                },
                            })
                        );
                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
};
