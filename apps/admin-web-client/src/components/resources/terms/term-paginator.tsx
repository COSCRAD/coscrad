import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FormControl, Grid, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { cyclicDecrement, cyclicIncrement } from '../../shared/math';
import { IUserQueryOptions, useFetchTermsQuery } from './store';

// TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-344] make this configurable
export const DEFAULT_PAGE_SIZE = 10;

const pageSizeOptions: number[] = [5, 10, 50, 100];

type TermPaginatorProps = {
    paginationOptions: IUserQueryOptions;
    setPaginationOptions: Dispatch<SetStateAction<IUserQueryOptions>>;
};

export const TermPaginator = ({
    paginationOptions,
    setPaginationOptions,
}: TermPaginatorProps): JSX.Element => {
    const { data, isLoading, isError } = useFetchTermsQuery(paginationOptions);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const { count, page } = data;

    const {
        pagination: { size: pageSize },
    } = paginationOptions;

    const pageCount = Math.ceil(count / pageSize);

    const startingRecordNumberHumanReadable = pageSize * (page - 1) + 1;

    // const endingRecordNumberHumanReadable =
    //     startingRecordNumberHumanReadable + (selected?.length || 0) - 1;

    const totalNumberOfPages = Math.ceil(count / pageSize);

    const updatePageSize = (newPageSize: number) => {
        if (newPageSize > paginationOptions.pagination.size) {
            setPaginationOptions({
                pagination: {
                    page: 1,
                    size: newPageSize,
                },
            });
        }

        setPaginationOptions((prevOptions) => ({
            ...prevOptions,
            pagination: {
                ...prevOptions.pagination,
                size: newPageSize,
            },
        }));
    };

    return (
        <Grid container justifyContent="flex-end" spacing={3}>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" sx={{ mr: 2, mt: 1 }}>
                    Showing Records: {startingRecordNumberHumanReadable}-
                    {/* {endingRecordNumberHumanReadable}/{count} &nbsp; Filtered Records: {count} */}
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
                        setPaginationOptions({
                            pagination: {
                                size: pageSize,
                                page: cyclicDecrement(page - 1, totalNumberOfPages) + 1,
                            },
                        });
                    }}
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
            </Grid>
            <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    onClick={() => {
                        setPaginationOptions({
                            pagination: {
                                size: pageSize,
                                page: cyclicIncrement(page - 1, totalNumberOfPages) + 1,
                            },
                        });
                    }}
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </Grid>
        </Grid>
    );
};
