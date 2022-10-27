import { renderWithProviders } from '../../utils/test-utils';
import { NavItemInfo } from './NavBar';
import { NavBarItem } from './NavBarItem';

const dummyNavBarItemProps: NavItemInfo = {
    link: 'http://samplesite.com',
    label: 'Sample Label',
};

describe('NavBarItem', () => {
    it('should render successfully', () => {
        const { baseElement } = renderWithProviders(<NavBarItem {...dummyNavBarItemProps} />);
        expect(baseElement).toBeTruthy();
    });
});
