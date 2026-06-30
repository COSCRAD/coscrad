import { Typography } from '@mui/material';
import { useFetchTermByIdQuery } from './store';
import { findOriginalMultilingualTextItem } from './term-index.page';

type TermDetailPageProps = {
    id: string;
};

export const TermDetailPage = ({ id }: TermDetailPageProps): JSX.Element => {
    console.log(`${TermDetailPage.name} rendered.`);

    const { data, isLoading, error } = useFetchTermByIdQuery(id);

    if (error) {
        if ('status' in error) {
            // you can access all properties of `FetchBaseQueryError` here
            const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);

            return (
                <div>
                    <div>An error has occurred:</div>
                    <div>{errMsg}</div>
                </div>
            );
        }
        // you can access all properties of `SerializedError` here
        return <div>{error.message}</div>;
    }

    if (isLoading || !data) {
        return <div>Loading...</div>;
    }

    const { name } = data;

    return <Typography variant="h5">Term: {findOriginalMultilingualTextItem(name)}</Typography>;
};
