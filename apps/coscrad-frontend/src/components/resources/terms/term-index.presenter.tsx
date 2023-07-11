import { ITermViewModel } from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { LinkOff } from '@mui/icons-material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { TermIndexState } from '../../../store/slices/resources/terms/types/term-index-state';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const TermIndexPresenter = (termsIndexResult: TermIndexState) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { entities: terms } = termsIndexResult;

    const headingLabels: HeadingLabel<ITermViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        // TODO We need to determine the `term` and `termEnglish` from a multilingual text property
        { propertyKey: 'name', headingLabel: 'Term' },
        { propertyKey: 'audioURL', headingLabel: 'Audio URL' },
        { propertyKey: 'contributor', headingLabel: 'Contributor' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ITermViewModel> = {
        id: renderAggregateIdCell,
        // TODO We need to determine the `term` and `termEnglish` from a multilingual text property
        name: ({ name }: ITermViewModel) => renderMultilingualTextCell(name, defaultLanguageCode),
        audioURL: ({ audioURL }: ITermViewModel) =>
            isNullOrUndefined(audioURL) ? (
                <LinkOff color="primary" />
            ) : (
                <AudioClipPlayer audioUrl={audioURL} />
            ),
        contributor: ({ contributor }: ITermViewModel) => contributor,
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={terms}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Terms'}
            filterableProperties={['name', 'contributor']}
        />
    );
};
