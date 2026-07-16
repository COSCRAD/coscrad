import { useAuth0 } from '@auth0/auth0-react';
import {
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Box, Stack, Typography } from '@mui/material';
import { ContributionsPresenter } from '../../shared/contributions-presenter';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';
import { useFetchTermByIdQuery } from './store';
import { findOriginalMultilingualTextItem } from './term-index.page';
import { TranslateTermForm } from './translate-term-form';

export const getTranslationsForLanguageSelection = (name: IMultilingualText): LanguageCode[] => {
    const languageCodesInUse = name.items.map((item) => item.languageCode);

    return languageCodesInUse;
};

const getOriginalTextItem = (name: IMultilingualText): IMultilingualTextItem => {
    return name.items.find(({ role }) => role === MultilingualTextItemRole.original);
};

export interface ResourceDetailProps {
    id: string;
}

export const TermDetail = ({ id }: ResourceDetailProps): JSX.Element => {
    console.log(`${TermDetail.name} rendered.`);

    const { isAuthenticated } = useAuth0();

    const { name, isPublished, contributions, vocabularyLists, isLoading, isError } =
        useFetchTermByIdQuery(id, {
            selectFromResult: (result) => ({
                name: result.data?.name,
                vocabularyLists: result.data?.vocabularyLists,
                contributions: result.data?.contributions,
                isPublished: result.data?.isPublished,
                isLoading: result.isLoading,
                isError: result.isError,
            }),
        });

    if (isLoading || !name) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const originalTermItem = findOriginalMultilingualTextItem(name);

    const languageCodesInUse = getTranslationsForLanguageSelection(name);

    return (
        <>
            <Typography variant="h3">Term</Typography>
            <Typography variant="h4">
                {originalTermItem.text} ({originalTermItem.languageCode}, {originalTermItem.role})
            </Typography>
            {name.items.length > 0 ? (
                <Box sx={{ marginTop: '5px' }}>
                    <Typography variant="h5">Translations:</Typography>
                    <Stack sx={{ marginLeft: '7px' }}>
                        {name.items
                            .filter((item) => item.role !== MultilingualTextItemRole.original)
                            .map((item) => (
                                <Typography
                                    key={`${item.role}-${item.languageCode}`}
                                    variant="body1"
                                >
                                    {item.text} ({item.languageCode}, {item.role})
                                </Typography>
                            ))}
                    </Stack>
                    {vocabularyLists.length > 0 ? (
                        <>
                            <Typography variant="h5">Vocabulary Lists:</Typography>
                            <Stack>
                                {vocabularyLists.map((vocabularyList) => {
                                    const { id, name } = vocabularyList;

                                    const originalVocabularyListItem = getOriginalTextItem(name);

                                    return (
                                        <Box key={id}>
                                            <Typography variant="h4">
                                                {originalVocabularyListItem.text}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </>
                    ) : null}
                </Box>
            ) : null}
            {isAuthenticated ? (
                <PresentFormWithOptionalGeneratedId
                    form={TranslateTermForm}
                    context={{
                        resourceId: id,
                        resourceType: ResourceType.term,
                        languageCodesInUse: languageCodesInUse,
                        buttonLabel: 'TRANSLATE TERM',
                    }}
                />
            ) : null}
            {contributions.length > 0 ? (
                <ContributionsPresenter contributions={contributions} />
            ) : null}
        </>
    );
};
