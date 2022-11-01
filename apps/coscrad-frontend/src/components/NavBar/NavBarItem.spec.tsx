import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../utils/test-utils';
import { NavItemInfo } from './NavBar';
import { NavBarItem } from './NavBarItem';

const dummyNavBarItemProps: NavItemInfo = {
    link: 'https://samplesite.com',
    label: 'Sample Label',
};

describe('NavBarItem', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(
            <MemoryRouter>
                <NavBarItem {...dummyNavBarItemProps} />
            </MemoryRouter>
        );

        expect(baseElement).toBeTruthy();
    });
});
