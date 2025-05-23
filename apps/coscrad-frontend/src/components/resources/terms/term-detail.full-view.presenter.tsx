import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ITermViewModel,
    IVocabularyListRecordForTerm,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import {
    CommaSeparatedList,
    ResourceDetailFullViewPresenter,
} from '../../../utils/generic-components/';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';

import { isNullOrUndefined, isString } from '@coscrad/validation-constraints';
import { Typography } from '@mui/material';
import { ResourceNamePresenterProps } from '../../../utils/generic-components/presenters/detail-views/resource-detail-presenter-header';
import { ExpandableMultilingualTextPresenter } from '../../../utils/generic-components/presenters/expandable-multilingual-text-presenter';

const VocabularyListRecordForTermPresenter = ({
    id: termId,
    vocabularyLists,
}: {
    id: string;
    vocabularyLists: IVocabularyListRecordForTerm[];
}): JSX.Element => (
    <Box>
        <Box
            elevation={0}
            component={Paper}
            sx={{ flexGrow: 1 }}
            data-testid={`vocabulary-lists-for-term-${termId}`}
        >
            Vocabulary Lists for this Term
        </Box>
        <CommaSeparatedList>
            {(vocabularyLists || []).map(({ name, id }) => {
                const originalTextItem = findOriginalTextItem(name);

                return (
                    <Link
                        to={`/${routes.resources.ofType(ResourceType.vocabularyList).detail(id)}`}
                    >
                        {originalTextItem.text}
                    </Link>
                );
            })}
        </CommaSeparatedList>
    </Box>
);

const TermNamePresenter = ({ name, variant }: ResourceNamePresenterProps): JSX.Element => {
    return (
        <Typography
            gutterBottom
            component="span"
            variant={variant}
            fontWeight="bold"
            color="primary"
        >
            {isString(name) || isNullOrUndefined(name) ? (
                name
            ) : (
                // Should we inject the multilingual text presenter instead?
                <ExpandableMultilingualTextPresenter text={name} />
            )}
        </Typography>
    );
};

export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributions,
    audioURL,
    vocabularyLists,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.term}
            contributions={contributions}
            NamePresenter={TermNamePresenter}
        >
            <Box
                data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.term, id)}
            />
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>
            {(vocabularyLists || []).length > 0 ? (
                <VocabularyListRecordForTermPresenter id={id} vocabularyLists={vocabularyLists} />
            ) : null}
        </ResourceDetailFullViewPresenter>
    );
};
