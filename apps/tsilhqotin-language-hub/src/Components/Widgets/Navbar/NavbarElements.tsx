import styled from '@emotion/styled';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink as Link } from 'react-router-dom';

export const Nav = styled.nav`
    background: rgb(236, 236, 236);
    height: 80px;
    display: flex;
    justify-content: space-between;
    padding: 0.5rem calc((100vw - 1000px) / 2);
    z-index: 10;
    /* Third Nav */
    /* justify-content: flex-start; */
`;

export const NavLink = styled(Link)`
    color: black;
    display: flex;
    align-items: center;
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    &.active {
        color: red;
    }
`;

export const Bars = styled(MenuIcon)`
    display: none;
    color: red;
    @media screen and (max-width: 768px) {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(-100%, 75%);
        font-size: 1.8rem;
        cursor: pointer;
    }
`;

export const NavMenu = styled.div`
    display: flex;
    font-family: inherit;
    padding: 0px;
    align-items: center;
    margin-right: -24px;
    /* Second Nav */
    /* margin-right: 24px; */
    /* Third Nav */
    /* width: 100vw;
  white-space: nowrap; */
    @media screen and (max-width: 1200px) {
        display: none;
    }
`;

export const NavBtn = styled.nav`
    display: flex;
    align-items: center;

    margin-right: 24px;
    /* Third Nav */
    /* justify-content: flex-end;
  width: 100vw; */
    @media screen and (max-width: 1200px) {
        display: none;
    }
`;

export const NavBtnLink = styled.div`
    border-radius: 4px;
    padding: 10px 22px;
    color: white;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    /* Second Nav */
    margin-left: 24px;
    &:hover {
        transition: all 0.2s ease-in-out;
    }
`;
