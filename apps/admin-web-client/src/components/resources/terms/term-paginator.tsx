import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FormControl, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { DEFAULT_PAGE_SIZE } from '../../shared/constants';
import { insertNumberInSequence } from '../../shared/insert-in-sequence';
import { cyclicDecrement, cyclicIncrement } from '../../shared/math';
import { useFetchTermsQuery } from './store';
import { setTermPage, setTermPageSize } from './store/term-index-query-options.slice';

// TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-344] make this configurable
const pageSizes: number[] = [5, 10, 50, 100];

const pageSizeOptions: number[] = pageSizes.includes(DEFAULT_PAGE_SIZE)
    ? insertNumberInSequence(pageSizes, DEFAULT_PAGE_SIZE)
    : pageSizes;

export const TermPaginator = (): JSX.Element => {
    const dispatch = useDispatch();

    const termIndexQueryOptions = useSelector(
        (state: RootState) => state.termIndexQueryOptionsSlice
    );

    console.log({ termIndexQueryOptions });

    const { data, isLoading, isError } = useFetchTermsQuery(termIndexQueryOptions);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const { entities: terms, count, page } = data;

    console.log({ terms });

    const pageSize = isNullOrUndefined(termIndexQueryOptions.pagination.size)
        ? DEFAULT_PAGE_SIZE
        : termIndexQueryOptions?.pagination?.size;

    const pageCount = Math.ceil(count / pageSize);

    const startingRecordNumberHumanReadable = pageSize * (page - 1) + 1;

    const endingRecordNumberHumanReadable =
        startingRecordNumberHumanReadable + (terms?.length || 0) - 1;

    const totalNumberOfPages = Math.ceil(count / pageSize);

    const updatePageSize = (newPageSize: number) => {
        // console.log({ newPageSize });

        if (newPageSize > termIndexQueryOptions.pagination.size) {
            dispatch(setTermPageSize(newPageSize));
            dispatch(setTermPage(1));
        }

        dispatch(setTermPageSize(newPageSize));
    };

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

                            updatePageSize(newPageSize);
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
                        dispatch(setTermPage(cyclicDecrement(page - 1, totalNumberOfPages) + 1));
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
            </Grid>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    onClick={() => {
                        dispatch(setTermPage(cyclicIncrement(page - 1, totalNumberOfPages) + 1));
                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
};
