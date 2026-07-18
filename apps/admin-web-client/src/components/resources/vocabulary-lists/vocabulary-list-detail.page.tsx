import { useAuth0 } from '@auth0/auth0-react';
import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { MultilingualTextPresenter } from '../../shared/multilingual-text-presenter';
import { getLabelForLanguage } from '../../shared/multilingual-text-presenter/get-label-for-language';
import { getTranslationsForLanguageSelection } from '../terms/term-detail.page';
import { findOriginalMultilingualTextItem } from '../terms/term-index.page';
import { useFetchVocabularyListByIdQuery } from './store';

export const VocabularyListDetail = (): JSX.Element => {
    console.log(`${VocabularyListDetail.name} rendered.`);

    const { id } = useParams();

    const { isAuthenticated } = useAuth0();

    const { name, entries, isLoading, isError } = useFetchVocabularyListByIdQuery(id, {
        selectFromResult: (result) => ({
            name: result.data?.name,
            entries: result.data?.entries,
            isLoading: result.isLoading,
            isError: result.isError,
        }),
    });

    if (isLoading || !name) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const originalNameItem = findOriginalMultilingualTextItem(name);

    const languageCodesInUse = getTranslationsForLanguageSelection(name);

    return (
        <>
            <Typography variant="h4">Vocabulary List:</Typography>
            <Typography variant="h3">
                {originalNameItem.text} ({getLabelForLanguage(originalNameItem.languageCode)},{' '}
                {originalNameItem.role})
            </Typography>
            <Stack>
                {entries.length > 0 ? (
                    <>
                        <Typography variant="h4">Terms:</Typography>
                        <Stack>
                            {entries.map((entry) => {
                                const originalTermName = findOriginalMultilingualTextItem(
                                    entry.term.name
                                );

                                return (
                                    <MultilingualTextPresenter text={entry.term.name} />
                                    // <Box sx={{ mb: '3px' }}>
                                    //     <Typography variant="h5">
                                    //         {originalTermName.text} ({entry.term.id})
                                    //     </Typography>
                                    //     <Box sx={{ ml: 0.5 }}>
                                    //         {entry.term.name.items.length > 0
                                    //             ? entry.term.name.items.map((translation) => {
                                    //                   const { languageCode, text, role } =
                                    //                       translation;

                                    //                   return (
                                    //                       <Typography variant="body1">
                                    //                           {text} ({languageCode}, {role})
                                    //                       </Typography>
                                    //                   );
                                    //               })
                                    //             : null}
                                    //     </Box>
                                    // </Box>
                                );
                            })}
                        </Stack>
                    </>
                ) : null}
            </Stack>
        </>
    );
};
