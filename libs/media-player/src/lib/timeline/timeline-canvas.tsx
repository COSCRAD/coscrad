interface TimelineCanvasProps {
    rulerTicks: number[];
}

export const TimelineCanvas = ({ rulerTicks }: TimelineCanvasProps) => {
    const blank = 1;

    return <div>{blank}</div>;
    // const drawCanvas: Draw = (context) => {
    //     context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    //     context.fillStyle = RULER_TICKS_AND_NUMBERS_COLOR;

    //     rulerTicks.forEach((tick, index) => {
    //         if (index % rulerTickFrequency !== 0) return;

    //         const tickX = tick * rulerTickOffset;

    //         context.fillRect(tickX, rulerTickY, rulerTickWidth, rulerTickHeight);
    //     });
    // };

    // return (
    //     <Box sx={{ border: '1px solid red' }}>
    //         <Canvas
    //             canvasId={`timeline-ruler-${index}`}
    //             draw={drawCanvas}
    //             width={MAX_CANVAS_WIDTH}
    //             height={rulerHeight}
    //             sxProps={sxProps}
    //         />
    //     </Box>
    // );
};
