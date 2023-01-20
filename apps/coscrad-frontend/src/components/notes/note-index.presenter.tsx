import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    ICompositeIdentifier,
    IEdgeConnectionMember,
    INoteViewModel,
} from '@coscrad/api-interfaces';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton } from '@mui/material';
import { useCallback, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { NoteIndexState } from '../../store/slices/notes/types/note-index-state';
import { HeadingLabel, IndexTable } from '../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../resources/utils/render-aggregate-id-cell';
import styles from './note-index.presenter.module.scss';
import { WebTestBreakdown } from './WebTestBreakdown';

const formatCompositeIentifier = ({ type, id }: ICompositeIdentifier): string => `${type}/${id}`;

/**
 * Sorts tuple of members of a dual edge connection with the `to` member first
 * and the `from` member last (returns [toMember,fromMember])
 *
 * TODO Unit test
 * TODO Break out into a utility lib
 */
const sortEdgeConnectionMembers = (members: IEdgeConnectionMember[]): IEdgeConnectionMember[] => {
    if (members.length !== 2) return members;

    // We want the `from` member to come first ("be smaller")
    return [...members].sort(({ role: roleA }, _) =>
        roleA === EdgeConnectionMemberRole.from ? -1 : 1
    );
};

interface DisplayConnectedResourcesInfoProps {
    resourceInfos: IEdgeConnectionMember[];
    connectionType: EdgeConnectionType;
}

const DisplayConnectedResourcesInfo = ({
    resourceInfos,
    connectionType,
}: DisplayConnectedResourcesInfoProps): JSX.Element => {
    if (connectionType === EdgeConnectionType.self) {
        const { compositeIdentifier } = resourceInfos[0];

        return <div>A note about {formatCompositeIentifier(compositeIdentifier)}</div>;
    }

    const [fromMember, toMember] = sortEdgeConnectionMembers(resourceInfos);

    const fromMessage = `connection from ${formatCompositeIentifier(
        fromMember.compositeIdentifier
    )} to ${formatCompositeIentifier(toMember.compositeIdentifier)}`;

    return <div>{fromMessage}</div>;
};

export const NoteIndexPresenter = ({ entities: notes }: NoteIndexState): JSX.Element => {
    const fullScreenHandle = useFullScreenHandle();
    const [screenState, setScreenState] = useState(false);

    const fullScreenChange = useCallback(
        (state) => {
            setScreenState(state);
        },
        [fullScreenHandle]
    );

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
        // we may want to limit or else wrap the note's text
        connectedResources: ({ connectedResources, connectionType }: INoteViewModel) => (
            // do we want a simple icon for this instead?
            <DisplayConnectedResourcesInfo
                resourceInfos={connectedResources}
                connectionType={connectionType}
            />
        ),
        connectionType: ({ connectionType }: INoteViewModel) =>
            // icon?
            connectionType === EdgeConnectionType.self ? 'Single Resource Note' : 'Connecting Note',
    };

    return (
        <>
            <IndexTable
                headingLabels={headingLabels}
                tableData={notes}
                cellRenderersDefinition={cellRenderersDefinition}
                heading={'Notes'}
                filterableProperties={['connectionType', 'note']}
            />
            {/* <WebNoteTest entities={notes} indexScopedActions={[]} /> */}
            <FullScreen
                className={styles['web3d-container']}
                handle={fullScreenHandle}
                onChange={fullScreenChange}
            >
                <div className={styles['book-actions']}>
                    {!screenState && (
                        <IconButton onClick={fullScreenHandle.enter}>
                            <FullscreenIcon />
                        </IconButton>
                    )}
                    {screenState && (
                        <IconButton onClick={fullScreenHandle.exit}>
                            <FullscreenExitIcon />
                        </IconButton>
                    )}
                    View Web Visualization
                </div>
                {/* <BabelTest /> */}
                {/* <TransformNode /> */}
                {/* <WebTest3D entities={notes} indexScopedActions={[]} /> */}
                <WebTestBreakdown />
            </FullScreen>
        </>
    );
};
