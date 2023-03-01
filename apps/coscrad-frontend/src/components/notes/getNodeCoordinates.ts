export const getNodeCoordinates = (id, resourceNodes) => {
    const coordinates = resourceNodes
        .filter((node) => node.nodeId === id)
        .map((selectedNode) => selectedNode.vectorCoords);
    // console.log(coordinates[0]);

    return coordinates[0];
};
