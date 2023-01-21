import { EdgeConnectionType } from '@coscrad/api-interfaces';
import { ConnectionByID } from './WebTestBreakdown';

const compositeIdentifierToStringID = (compositeIdentifier) => {
    return `${compositeIdentifier.type}/${compositeIdentifier.id}`;
};

const isDual = (type) => (type === EdgeConnectionType.dual ? true : false);

export type Raw3DCoordinates = [number, number, number];

export type EndPointCoordinates = [Raw3DCoordinates, Raw3DCoordinates];

export type ResourceNode = {
    id: string;
    coordinates: Raw3DCoordinates;
};

export type NoteEdge = {
    id: string;
    note: string;
    endPointCoordinates: EndPointCoordinates;
};

export type BabylonJSDataFrame = {
    resourceNodes: ResourceNode[];
    noteEdges: NoteEdge[];
    connectionsByID?: ConnectionByID[];
};

export const prepareBabylonJSDataFrame = (notes): BabylonJSDataFrame => {
    const dualNotes = notes.filter(({ connectionType }) => isDual(connectionType));

    const connectedResources = dualNotes.map((note) => note.connectedResources);

    const resourceNodes = connectedResources
        .map((connection) =>
            connection.map((resource) =>
                compositeIdentifierToStringID(resource.compositeIdentifier)
            )
        )
        .reduce((acc, currentValue) => acc.concat(currentValue), [])
        .reduce((acc, currentValue) => {
            if (!acc.includes(currentValue)) {
                return [...acc, currentValue];
            }
            return acc;
        }, [])
        .reduce((acc, currentValue, index) => {
            const factor = index % 2 === 0 ? -(index + 4) : index + 4;
            const emptyArray = [0, 0, 0];
            const coords = emptyArray.reduce((coordAcc, coordCurrent) => {
                return [...coordAcc, Math.round(factor * Math.random() + Math.random() * 6)];
            }, []);

            return [...acc, { id: currentValue, coordinates: coords }];
        }, []);

    const getCoordinatesById = (stringID) => {
        const newCoords = resourceNodes.reduce((acc, { id, coordinates }: ResourceNode) => {
            if (stringID === id) {
                return acc.concat(coordinates);
            }
            return acc;
        }, []);
        return newCoords;
    };

    const noteEdges = dualNotes.map(({ id, note, connectedResources }) => {
        const edgeCoordinates = connectedResources.map(({ compositeIdentifier }) => {
            const stringID = compositeIdentifierToStringID(compositeIdentifier);
            const newCoords = getCoordinatesById(stringID);

            return newCoords;
        });
        return { id: id, note: note, endPointCoordinates: edgeCoordinates };
    });

    const connectionsByID: ConnectionByID[] = dualNotes.map(({ connectedResources }) => {
        const toResourceID = compositeIdentifierToStringID(
            connectedResources[0].compositeIdentifier
        );
        const fromResourceID = compositeIdentifierToStringID(
            connectedResources[1].compositeIdentifier
        );

        return [toResourceID, fromResourceID];
    });

    return { resourceNodes: resourceNodes, noteEdges: noteEdges, connectionsByID: connectionsByID };
};
