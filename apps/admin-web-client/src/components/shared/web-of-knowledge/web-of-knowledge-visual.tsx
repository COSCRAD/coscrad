import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D, {
    ForceGraphMethods,
    GraphData,
    LinkObject,
    NodeObject,
} from 'react-force-graph-3d';
import * as THREE from 'three';

interface MyCustomNode {
    id: string;
    name: string;
    val: number;
    color: string;
}

interface MyCustomLink {
    source: string;
    target: string;
}

type StrictNode = NodeObject & MyCustomNode;

type StrictLink = LinkObject & MyCustomLink;

type StrictGraphData = GraphData<StrictNode, StrictLink>;

// interface WebOfKnowledgeVisualProps {}

export const WebOfKnowledgeVisual = (): JSX.Element => {
    const POPUP_WIDTH = 260;
    const POPUP_HEIGHT = 110;

    // 🔽 CHANGE THIS VALUE: Lower numbers bring the popup closer to the node
    // Setting this to 5px or 10px places it right above the node's edge.
    const OFFSET_Y = 90;

    const fgContainerRef = useRef(null);

    const fgRef = useRef<ForceGraphMethods<StrictNode, StrictLink> | undefined>(null);

    const [selectedNode, setSelectedNode] = useState<StrictNode | null>(null);

    const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const graphData: StrictGraphData = useMemo(() => {
        return {
            nodes: [
                { id: 'A', name: 'Node Alpha', val: 5, color: '#3b82f6' }, // 'val' sets node sphere size
                { id: 'B', name: 'Node Bravo', val: 3, color: '#d4f63b' },
                { id: 'C', name: 'Node Charlie', val: 3, color: '#4bf63b' },
                { id: 'D', name: 'Node Delta', val: 8, color: '#e63bf6' },
            ],
            links: [
                { source: 'A', target: 'B' },
                { source: 'A', target: 'C' },
                { source: 'B', target: 'D' },
                { source: 'C', target: 'D' },
            ],
        };
    }, []);

    // 3. Calculator function to project 3D coordinates to Screen coordinates
    const updatePopupPosition = useCallback(() => {
        if (!fgRef.current || !selectedNode) return;

        // Extract the live coordinates appended to the node by the physics engine
        const { x, y, z } = selectedNode;

        if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            // Use the built-in projection method
            const screenCoords = fgRef.current.graph2ScreenCoords(x, y, z);

            const containerWidth = fgContainerRef.current.clientWidth;
            const containerHeight = fgContainerRef.current.clientHeight;

            // The calculation applies the updated OFFSET_Y value here
            let targetX = screenCoords.x;
            let targetY = screenCoords.y - OFFSET_Y;

            const padding = 15;

            // Apply your boundary protection boundaries
            targetX = Math.max(
                POPUP_WIDTH / 2 + padding,
                Math.min(targetX, containerWidth - POPUP_WIDTH / 2 - padding)
            );
            targetY = Math.max(
                POPUP_HEIGHT + padding,
                Math.min(targetY, containerHeight - padding)
            );

            setPopupPos({ x: targetX, y: targetY });
        }
    }, [selectedNode, OFFSET_Y]);

    // 4. Listen to graph camera adjustment cycles to reposition the HTML layer dynamically
    const handleEngineTick = useCallback(() => {
        if (selectedNode) {
            updatePopupPosition();
        }
    }, [selectedNode, updatePopupPosition]);

    const handleNodeClick = useCallback(
        (node: any) => {
            if (
                isNullOrUndefined(fgRef.current) ||
                typeof node.x !== 'number' ||
                typeof node.y !== 'number' ||
                typeof node.z !== 'number'
            ) {
                return;
            }

            const activeNode = node as MyCustomNode & { x: number; y: number; z: number };

            setSelectedNode(activeNode);

            console.log(`Focusing on: ${activeNode.name} with score: ${activeNode.val}`);

            // Aim at node from outside it
            const distance = 80;
            const hypotenuse = Math.hypot(activeNode.x, activeNode.y, activeNode.z);
            const distRatio = distance / (hypotenuse || 1);

            fgRef.current.cameraPosition(
                {
                    x: activeNode.x * distRatio,
                    y: activeNode.y * distRatio,
                    z: activeNode.z * distRatio,
                }, // new position
                activeNode, // lookAt ({ x, y, z })
                3000 // ms transition duration
            );

            // Initial tracking draw
            setTimeout(() => {
                if (fgRef.current) {
                    const screenCoords = fgRef.current.graph2ScreenCoords(node.x, node.y, node.z);
                    setPopupPos({ x: screenCoords.x, y: screenCoords.y });
                }
            }, 10);
        },
        [fgRef]
    );

    useEffect(() => {
        if (!fgContainerRef.current) return;

        // Use ResizeObserver to watch the specific DOM node container
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Retrieve the accurate pixel sizing of the containing element
                const { width, height } = entry.contentRect;

                console.log({ w: width, h: height });

                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(fgContainerRef.current);

        // Clean up the observer when the component unmounts
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <Box
            ref={fgContainerRef}
            style={{
                width: '100%',
                height: '70vh',
                position: 'relative',
                backgroundColor: '#fdac6a',
            }}
        >
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                // --- Node Customization ---
                nodeLabel="name" // Key from data to show on hover tooltip
                nodeColor="color"
                nodeOpacity={0.9}
                nodeVal="val" // Maps node radius to the 'val' property in your data
                // --- Link Customization ---
                linkColor={() => '#00d9ff'} // Light grey connection lines
                linkWidth={0.25}
                // --- Optional: Animated Particles running along links ---
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkCurvature={0.45}
                onNodeClick={handleNodeClick}
                onEngineTick={handleEngineTick}
                onBackgroundClick={() => setSelectedNode(null)}
                onNodeDragEnd={(node) => {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                }}
                // 🛠️ GENERATE CUSTOM 3D OBJECT WITH CONDITIONALLY HIGHLIGHTED HALO
                nodeThreeObject={(node: any) => {
                    // 1. Create a ThreeJS Group container to house our meshes
                    const group = new THREE.Group();

                    const nodeColor = node.color || '#38bdf8';

                    // 2. Define the core base node sphere dimensions and material
                    const baseRadius = 5;
                    const coreGeometry = new THREE.SphereGeometry(baseRadius, 16, 16);
                    const coreMaterial = new THREE.MeshLambertMaterial({
                        color: nodeColor,
                    });
                    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
                    group.add(coreMesh);

                    // 3. CHECK IF FOCUSED: If yes, layer a glowing wireframe shell ring around it
                    if (selectedNode && node.id === selectedNode.id) {
                        // Make the halo slightly larger than the core node sphere radius
                        const haloGeometry = new THREE.SphereGeometry(baseRadius + 1.5, 12, 12);

                        const haloMaterial = new THREE.MeshBasicMaterial({
                            color: '#fda500', // Uses the node's native color tracking
                            wireframe: true, // 💡 THE HIGHLIGHT: Forces wireframe layout pattern
                            transparent: true,
                            opacity: 0.9, // Subdued glow effect
                        });

                        const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
                        group.add(haloMesh);
                    }

                    return group;
                }}
            />

            {selectedNode && (
                <div
                    id="popup_graph_node_info"
                    style={{
                        position: 'absolute',
                        // Use transform Translate instead of top/left to avoid browser layout re-flow hits
                        left: `${popupPos.x}px`,
                        top: `${popupPos.y}px`,
                        transform: 'translate(-50%, -100%)',
                        width: `${POPUP_WIDTH}px`,
                        boxSizing: 'border-box',
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(56, 189, 248, 0.4)', // Cyan accent border
                        borderRadius: '8px',
                        padding: '14px',
                        color: '#f8fafc',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)',
                        pointerEvents: 'auto', // Ensures user can interact with popup content
                        fontFamily: 'sans-serif',
                        zIndex: 100,
                        transition: 'transform 0.05s ease-out', // Smooths tracking jitter slightly
                    }}
                >
                    {/* Decorative tail arrow indicator */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-6px',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: '12px',
                            height: '12px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            borderRight: '1px solid rgba(56, 189, 248, 0.4)',
                            borderBottom: '1px solid rgba(56, 189, 248, 0.4)',
                        }}
                    />

                    {/* Header row with a Close Button */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                color: '#38bdf8',
                                fontWeight: 'bold',
                            }}
                        >
                            Group?
                        </span>
                        <button
                            onClick={() => setSelectedNode(null)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '4px',
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                        {selectedNode.name}
                    </h3>

                    <p
                        style={{
                            fontSize: '14px',
                            color: '#cbd5e1',
                            lineHeight: '1.5',
                            margin: '0 0 16px 0',
                        }}
                    >
                        {selectedNode.id}
                    </p>

                    <hr
                        style={{
                            border: 'none',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            margin: '12px 0',
                        }}
                    />

                    {/* Technical Metadata Rows */}
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr',
                            gap: '6px',
                        }}
                    >
                        <strong>Node ID:</strong>{' '}
                        <span style={{ color: '#f1f5f9' }}>{selectedNode.id}</span>
                        <strong>Weight:</strong>{' '}
                        <span style={{ color: '#f1f5f9' }}>{selectedNode.val} units</span>
                    </div>
                </div>
            )}
        </Box>
    );
};
