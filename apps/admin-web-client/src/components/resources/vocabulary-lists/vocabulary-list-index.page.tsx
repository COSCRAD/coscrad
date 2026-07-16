import { IMultilingualText } from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { findOriginalMultilingualTextItem } from '../terms/term-index.page';
import { useFetchVocabularyListsQuery } from './store';

type VocabularyListListingProps = {
    id: string;
    name: IMultilingualText;
    isPublished: boolean;
};

const VocabularyListListing = ({
    id,
    name,
    isPublished,
}: VocabularyListListingProps): JSX.Element => {
    const linkUrl = `/vocabularyLists/${id}`;

    const originalTermItem = findOriginalMultilingualTextItem(name);

    return (
        <Typography variant="body1">
            <Link to={linkUrl}>
                {originalTermItem.text}, {isPublished ? 'Published' : 'Not Published'}
            </Link>
        </Typography>
    );
};

export const VocabularyListsIndex = (): JSX.Element => {
    const { data, isLoading, isError } = useFetchVocabularyListsQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const { entities } = data;

    return (
        <Stack>
            {entities.length > 0 ? (
                <>
                    {entities.map((vocabularyList) => {
                        const { id, name, isPublished } = vocabularyList;

                        return (
                            <VocabularyListListing
                                key={`vocabulary-list-${id}`}
                                id={id}
                                name={name}
                                isPublished={isPublished}
                            />
                        );
                    })}
                </>
            ) : (
                <Typography variant="h4">No Vocabulary Lists Have Been Added</Typography>
            )}
        </Stack>
    );
};
