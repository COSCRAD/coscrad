import { Typography } from '@mui/material';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

export const QRCodeForThisPage = (): JSX.Element => {
    const canvasRef = useRef();

    useEffect(() => {
        if (canvasRef.current) QRCode.toCanvas(canvasRef?.current, window.location.href);
    }, [canvasRef]);

    return (
        <>
            <Typography variant="h4">QR Code for this page</Typography>
            <canvas ref={canvasRef} />
        </>
    );
};
