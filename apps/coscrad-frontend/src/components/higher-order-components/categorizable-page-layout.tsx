import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Button, Drawer } from '@mui/material';
import { ReactNode, useState } from 'react';
import { CommandPanel } from '../commands';

interface CategorizablePageLayoutProps {
    bottomDrawerContent: JSX.Element;
    rightSideDrawerContent: JSX.Element;
    commandPanel?: JSX.Element;
    children: ReactNode;
}

export const CategorizablePageLayout = ({
    bottomDrawerContent,
    rightSideDrawerContent,
    commandPanel,
    children,
}: CategorizablePageLayoutProps) => {
    const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
    const [rightSideDrawerOpen, setRightSideDrawerOpen] = useState(false);

    return (
        <>
            {children}
            <Button
                onClick={() => {
                    setBottomDrawerOpen(!bottomDrawerOpen);
                }}
            >
                Notes
            </Button>
            <Button
                onClick={() => {
                    setRightSideDrawerOpen(!rightSideDrawerOpen);
                }}
            >
                Connections
            </Button>
            <Drawer anchor="right" variant="persistent" open={rightSideDrawerOpen}>
                {rightSideDrawerContent}
            </Drawer>
            <Drawer anchor="bottom" variant="persistent" open={bottomDrawerOpen}>
                {bottomDrawerContent}
            </Drawer>
            {!isNullOrUndefined(CommandPanel) ? <>{commandPanel}</> : null}
        </>
    );
};
