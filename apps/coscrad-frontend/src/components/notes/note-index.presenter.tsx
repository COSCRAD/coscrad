import {
    AggregateType,
    EdgeConnectionType,
    ICompositeIdentifier,
    IConnectionMembers,
    INoteViewModel,
} from '@coscrad/api-interfaces';
import { NoteIndexState } from '../../store/slices/notes/types/note-index-state';
import { HeadingLabel, IndexTable } from '../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { truncateText } from '../../utils/string-processor/shorten-string';
import { renderAggregateIdCell } from '../resources/utils/render-aggregate-id-cell';

const MAX_NOTE_TEXT_LENGTH = 50; // 50 characters

const formatCompositeIentifier = ({ type, id }: ICompositeIdentifier): string => `${type}/${id}`;

interface DisplayConnectedResourcesInfoProps {
    connectionMembers: IConnectionMembers;
    connectionType: EdgeConnectionType;
}

const DisplayConnectedResourcesInfo = ({
    connectionMembers,
    connectionType,
}: DisplayConnectedResourcesInfoProps): JSX.Element => {
    if (connectionType === EdgeConnectionType.self) {
        const compositeIdentifier = connectionMembers.to.resource;

        return <div>A note about {formatCompositeIentifier(compositeIdentifier)}</div>;
    }

    // here we know we have a connection

    const {
        from: { resource: fromMember },
        to: { resource: toMember },
    } = connectionMembers;

    const fromMessage = `connection from ${formatCompositeIentifier(
        fromMember
    )} to ${formatCompositeIentifier(toMember)}`;

    return <div>{fromMessage}</div>;
};

export const NoteIndexPresenter = ({ entities: notes }: NoteIndexState): JSX.Element => {
    const headingLabels: HeadingLabel<INoteViewModel>[] = [
        {
            propertyKey: 'id',
            headingLabel: 'Link',
        },
        {
            propertyKey: 'note',
            headingLabel: 'Note',
        },
        {
            propertyKey: 'connectedResources',
            headingLabel: 'Connected Resources',
        },
        {
            propertyKey: 'connectionType',
            headingLabel: 'Connection Type',
        },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<INoteViewModel> = {
        id: renderAggregateIdCell,
        // we may want to limit the note's text
        note: ({ note }) => truncateText(note.original.text, MAX_NOTE_TEXT_LENGTH),
        connectedResources: ({ connectedResources, connectionType }: INoteViewModel) => (
            // do we want a simple icon for this instead?
            <DisplayConnectedResourcesInfo
                connectionType={connectionType}
                connectionMembers={connectedResources}
            />
        ),
        connectionType: ({ connectionType }: INoteViewModel) =>
            // icon?
            connectionType === EdgeConnectionType.self ? 'Single Resource Note' : 'Connecting Note',
    };

    return (
        <IndexTable
            type={AggregateType.note}
            data-testid="note-index"
            headingLabels={headingLabels}
            tableData={notes}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Notes'}
            filterableProperties={['connectionType', 'note']}
        />
    );
};
