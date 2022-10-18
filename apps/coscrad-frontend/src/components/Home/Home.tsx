import './Home.module.scss';

export interface HomeProps {
    siteDescription: string;
}

export function Home({ siteDescription }: HomeProps) {
    return <div>{siteDescription}</div>;
}

export default Home;
