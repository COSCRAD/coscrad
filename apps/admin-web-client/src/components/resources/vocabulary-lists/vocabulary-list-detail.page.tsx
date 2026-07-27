import { useAuth0 } from '@auth0/auth0-react';
import { Box, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { ContributionsPresenter } from '../../shared/contributions-presenter';
import { MultilingualTextPresenter } from '../../shared/multilingual-text-presenter';
import { getLabelForLanguage } from '../../shared/multilingual-text-presenter/get-label-for-language';
import { getTranslationsForLanguageSelection } from '../terms/term-detail.page';
import { findOriginalMultilingualTextItem } from '../terms/term-list.containter';
import { useFetchVocabularyListByIdQuery } from './store';

export const VocabularyListDetail = (): JSX.Element => {
    console.log(`${VocabularyListDetail.name} rendered.`);

    const { id } = useParams();

    const { isAuthenticated } = useAuth0();

    const { name, entries, contributions, isLoading, isError } = useFetchVocabularyListByIdQuery(
        id,
        {
            selectFromResult: (result) => ({
                name: result.data?.name,
                entries: result.data?.entries,
                contributions: result.data?.contributions,
                isLoading: result.isLoading,
                isError: result.isError,
            }),
        }
    );

    if (isLoading || !name) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const originalNameItem = findOriginalMultilingualTextItem(name);

    const languageCodesInUse = getTranslationsForLanguageSelection(name);

    return (
        <>
            <Typography variant="h4">Vocabulary List:</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ mr: 1 }}>
                    {originalNameItem.text} ({getLabelForLanguage(originalNameItem.languageCode)},{' '}
                    {originalNameItem.role})
                </Typography>
                {contributions.length > 0 ? (
                    <ContributionsPresenter contributions={contributions} />
                ) : null}
            </Box>
            <Stack>
                {entries.length > 0 ? (
                    <>
                        <Typography variant="h4" sx={{ mb: 2 }}>
                            Terms:
                        </Typography>
                        <Stack>
                            {entries.map((entry) => {
                                const {
                                    term: { id },
                                } = entry;

                                return (
                                    <MultilingualTextPresenter text={entry.term.name} termId={id} />
                                );
                            })}
                        </Stack>
                    </>
                ) : null}
            </Stack>
        </>
    );
};
