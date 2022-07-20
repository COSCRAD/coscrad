import styled from 'styled-components';

export const Container = styled.div`
    padding: 60px 50px;
    background-image: linear-gradient(to top, rgba(252, 8, 0, 255), rgba(255, 251, 119, 255));
`;

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 1000px;
    margin: 0 auto;
`;

export const Column = styled.div`
    display: flex;
    flex-direction: column;
    text-align: left;
    margin-left: 60px;
`;

export const Row = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    grid-gap: 20px;

    @media (max-width: 1000px) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
`;

export const Link = styled.div`
    color: #000;
    margin-bottom: 20px;
    font-size: 18px;
    text-decoration: none;

    &:hover {
        color: #fff;
        transition: 200ms ease-in;
    }
`;

export const Titles = styled.div`
    font-size: 24px;
    color: #000;
    margin-bottom: 40px;
    font-weight: bold;
`;
