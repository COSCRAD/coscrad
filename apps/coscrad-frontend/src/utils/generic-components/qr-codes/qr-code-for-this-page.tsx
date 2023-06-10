import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

export const QRCodeForThisPage = (): JSX.Element => {
    const canvasRef = useRef();

    useEffect(() => {
        if (canvasRef.current) QRCode.toCanvas(canvasRef?.current, window.location.href);
    }, [canvasRef]);

    return (
        <Accordion>
            <AccordionSummary>QR Code for this Page</AccordionSummary>
            <AccordionDetails>
                <canvas ref={canvasRef} />
            </AccordionDetails>
        </Accordion>
    );
};
