import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoIcon from '@mui/icons-material/Info';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ContributionsPresenter } from '../../shared/contributions-presenter';
import { getSpeakersStatementForTerm } from '../../shared/getSpeakersStatementForTerm';
import { termApi } from './store';
import { getTermTranslations } from './term-detail.page';
import { findOriginalMultilingualTextItem } from './term-list.container';

interface TermDetailThumbnailPresenterProps {
    id: string;
    shouldDisplayActionButtons: boolean;
}

export const TermDetailThumbnailPresenter = ({
    id,
    shouldDisplayActionButtons,
}: TermDetailThumbnailPresenterProps): JSX.Element => {
    const { name, contributions, isLoading, isError } =
        termApi.endpoints.fetchTermById.useQueryState(id, {
            skip: !id,
            selectFromResult: (result) => ({
                name: result.data?.name,
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

    const speakersStatementForTerm = getSpeakersStatementForTerm(contributions);

    // console.log({ speakersStatementForTerm });

    return (
        <>
            <Typography variant="h4">Term</Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ mr: 1 }}>
                    {originalTermItem.text} ({originalTermItem.languageCode},{' '}
                    {originalTermItem.role})
                </Typography>
                <IconButton sx={{ mt: -1 }}>
                    <Tooltip title={`ID: ${id}`}>
                        <InfoIcon />
                    </Tooltip>
                </IconButton>
                {contributions.length > 0 ? (
                    <ContributionsPresenter contributions={contributions} />
                ) : null}
            </Box>
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
                </Box>
            ) : null}
            {shouldDisplayActionButtons ? (
                <Box sx={{ justifyContent: 'flex-end' }}>
                    {/* <Box sx={{ pl: 8 }}>
                            <Tooltip title="View Connections">
                                <Link to={`/spatialFeatures/${id}`}>
                                    <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                                        <HubIcon sx={{ fontSize: '20px' }} />
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        </Box> */}
                    <Box sx={{ pl: 1 }}>
                        <Tooltip title="View Full Record">
                            <Link to={`/terms/${id}`}>
                                <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                                    <ArrowForwardIosIcon sx={{ fontSize: '20px' }} />
                                </IconButton>
                            </Link>
                        </Tooltip>
                    </Box>
                </Box>
            ) : null}
        </>
    );
};
