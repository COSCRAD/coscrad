import { SxProps, styled } from '@mui/material';
import { Draw, useCanvas } from './use-canvas';

const StyledCanvas = styled('canvas')({
    display: 'block',
    margin: 0,
    padding: 0,
});

interface CanvasProps {
    canvasId: string;
    draw: Draw;
    width: number;
    height: number;
    sxProps: SxProps;
}

export const Canvas = ({ canvasId, draw, width, height, sxProps }: CanvasProps) => {
    const ref = useCanvas(draw);

    const testId = `${canvasId}-canvas`;

    return (
        <StyledCanvas sx={sxProps} data-testid={testId} ref={ref} width={width} height={height} />
    );
};
