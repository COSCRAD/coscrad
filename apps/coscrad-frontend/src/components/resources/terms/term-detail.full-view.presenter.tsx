import {
    AggregateType,
    ICategorizableDetailQueryResult,
    ITermViewModel,
    IVocabularyListRecordForTerm,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box, Paper } from '@mui/material';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import {
    CommaSeparatedList,
    ResourceDetailFullViewPresenter,
} from '../../../utils/generic-components/';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';

import { ResourceNamePresenterProps } from '../../../utils/generic-components/presenters/detail-views/resource-detail-presenter-header';
import { FlatMultilingualTextPresenter } from '../../../utils/generic-components/presenters/flat-multilingual-text-presenter';
import { groupMultilingualTextItems } from '../../../utils/generic-components/presenters/group-multilingual-text-items';

const VocabularyListRecordForTermPresenter = ({
    id: termId,
    vocabularyListsById,
}: {
    id: string;
    vocabularyListsById: Record<string, IVocabularyListRecordForTerm>;
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
            {Object.keys(vocabularyListsById).map((key) => {
                const vocabularyListName = vocabularyListsById[key].name.original.text;

                return (
                    <Link
                        to={`/${routes.resources.ofType(ResourceType.vocabularyList).detail(key)}`}
                    >
                        {vocabularyListName}
                    </Link>
                );
            })}
        </CommaSeparatedList>
    </Box>
);

const TermNamePresenter = ({ name }: ResourceNamePresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { primaryMultilingualTextItem, translations } = groupMultilingualTextItems(
        name,
        defaultLanguageCode
    );

    return (
        <FlatMultilingualTextPresenter
            primaryMultilingualTextItem={primaryMultilingualTextItem}
            translations={translations}
        />
    );
};

export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributions,
    audioURL,
    vocabularyListsById,
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
            {(Object.keys(vocabularyListsById) || {}).length > 0 ? (
                <VocabularyListRecordForTermPresenter
                    id={id}
                    vocabularyListsById={vocabularyListsById}
                />
            ) : null}
        </ResourceDetailFullViewPresenter>
    );
};
