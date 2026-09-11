import {
    ArrowBackIosNew as ArrowBackIosNewIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
} from '@mui/icons-material';
import { FormControl, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useFetchTermsQuery } from '../../resources/terms/store';
import { DEFAULT_PAGE_SIZE } from '../constants';
import { insertNumberInSequence } from '../insert-in-sequence';
import { cyclicDecrement, cyclicIncrement } from '../math';
import {
    setContributorPage,
    setContributorPageSize,
} from './store/contributor-index-query-options.slice';

const pageSizes: number[] = [5, 10, 50, 100];

const pageSizeOptions: number[] = pageSizes.includes(DEFAULT_PAGE_SIZE)
    ? insertNumberInSequence(pageSizes, DEFAULT_PAGE_SIZE)
    : pageSizes;

export const ResourcePaginator = (): JSX.Element => {
    const dispatch = useDispatch();

    const contributorIndexQueryOptions = useSelector(
        (state: RootState) => state.contributorIndexQueryOptionsSlice
    );

    const { data, isLoading, isError } = useFetchTermsQuery(contributorIndexQueryOptions);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const { entities: terms, count, page } = data;

    const {
        pagination: { size: pageSize },
    } = contributorIndexQueryOptions;

    const pageCount = Math.ceil(count / pageSize);

    const startingRecordNumberHumanReadable = pageSize * (page - 1) + 1;

    const endingRecordNumberHumanReadable =
        startingRecordNumberHumanReadable + (terms?.length || 0) - 1;

    const totalNumberOfPages = Math.ceil(count / pageSize);

    const updatePageSize = (newPageSize: number) => {
        console.log({ newPageSize });

        if (newPageSize > contributorIndexQueryOptions.pagination.size) {
            dispatch(setContributorPageSize(newPageSize));
            dispatch(setContributorPage(1));
        }

        dispatch(setContributorPageSize(newPageSize));
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
                        dispatch(
                            setContributorPage(cyclicDecrement(page - 1, totalNumberOfPages) + 1)
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
                            setContributorPage(cyclicIncrement(page - 1, totalNumberOfPages) + 1)
                        );
                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
};
