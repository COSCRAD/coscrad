import { ReactNode } from 'react';

interface CategorizablePageLayoutProps {
    bottomDrawer: JSX.Element;
    rightSideDrawer: JSX.Element;
    children: ReactNode;
}

export const CategorizablePageLayout = ({
    bottomDrawer,
    rightSideDrawer,
    children,
}: CategorizablePageLayoutProps) => {
    return (
        <>
            {children}
            {rightSideDrawer}
            {bottomDrawer}
        </>
    );
};
