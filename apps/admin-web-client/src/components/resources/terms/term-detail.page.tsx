import { useAuth0 } from '@auth0/auth0-react';
import {
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import InfoIcon from '@mui/icons-material/Info';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ContributionsPresenter } from '../../shared/contributions-presenter';
import { getSpeakersStatementForTerm } from '../../shared/getSpeakersStatementForTerm';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';
import { AttributeTermToSpeaker } from './add-speaker-to-term-form';
import { useFetchTermByIdQuery } from './store';
import { findOriginalMultilingualTextItem } from './term-list.container';
import { TranslateTermForm } from './translate-term-form';

export const getTermTranslations = (name: IMultilingualText): IMultilingualTextItem[] => {
    const translations = name.items.filter(
        (item) => item.role !== MultilingualTextItemRole.original
    );

    return translations;
};

export const getTranslationsForLanguageSelection = (name: IMultilingualText): LanguageCode[] => {
    const languageCodesInUse = name.items.map((item) => item.languageCode);

    return languageCodesInUse;
};

export const getOriginalTextItem = (name: IMultilingualText): IMultilingualTextItem => {
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

    const translations = getTermTranslations(name);

    const languageCodesInUse = getTranslationsForLanguageSelection(name);

    const speakersStatementForTerm = getSpeakersStatementForTerm(contributions);

    console.log({ speakersStatementForTerm });

    return (
        <>
            <Typography variant="h3">Term</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ mr: 1, color: '#017e73ff' }} aria-label={id}>
                    {originalTermItem.text} ({originalTermItem.languageCode},{' '}
                    {originalTermItem.role})
                </Typography>
                <IconButton>
                    <Tooltip title={`ID: ${id}`}>
                        <InfoIcon />
                    </Tooltip>
                </IconButton>
                {contributions.length > 0 ? (
                    <ContributionsPresenter contributions={contributions} />
                ) : null}
            </Box>
            {isAuthenticated ? (
                <PresentFormWithOptionalGeneratedId
                    form={AttributeTermToSpeaker}
                    context={{
                        resourceId: id,
                        buttonLabel: 'ADD SPEAKER(S) FOR TERM',
                    }}
                />
            ) : null}
            {!isNullOrUndefined(speakersStatementForTerm) ? (
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="h6">{speakersStatementForTerm}</Typography>
                </Box>
            ) : null}
            {translations.length > 0 ? (
                <Box sx={{ mt: '5px' }}>
                    <Typography variant="h5">Translations:</Typography>
                    <Stack sx={{ ml: 1, mb: 1 }}>
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
                            <Typography variant="h5">
                                Vocabulary Lists that include this Term:
                            </Typography>
                            <Stack sx={{ ml: '7px' }}>
                                {vocabularyLists.map((vocabularyList) => {
                                    const { id, name } = vocabularyList;

                                    const href = `/vocabularyLists/${id}`;

                                    const originalVocabularyListItem = getOriginalTextItem(name);

                                    return (
                                        <Box key={id}>
                                            <Link
                                                to={href}
                                                style={{ textDecoration: 'none', color: '#000' }}
                                            >
                                                {originalVocabularyListItem.text}
                                            </Link>
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
        </>
    );
};
