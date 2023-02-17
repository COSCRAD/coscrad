import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { NavItemItemProps, NavMenuItem } from './nav-menu-item';

const handleClose = () => {};

const dummyNavBarItemProps: NavItemItemProps = {
    navItemInfo: {
        link: 'https://samplesite.com',
        label: 'Sample Label',
    },
    handleClose: handleClose,
};

describe('NavBarItem', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <NavMenuItem {...dummyNavBarItemProps} />
            </MemoryRouter>
        );

        expect(baseElement).toBeTruthy();
    });
});
