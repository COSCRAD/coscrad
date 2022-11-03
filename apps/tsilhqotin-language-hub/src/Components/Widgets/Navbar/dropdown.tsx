import { Link } from 'react-router-dom';

export function Dropdown() {
    return (
        <div>
            <Link className="menu__item" to="/About" reloadDocument={true}>
                About
            </Link>
            <Link className="menu__item" to="/Radio" reloadDocument={true}>
                104.5 FM
            </Link>
            <Link className="menu__item" to="/Apps" reloadDocument={true}>
                Apps
            </Link>
            <Link className="menu__item" to="/Songs" reloadDocument={true}>
                Songs
            </Link>
            <Link className="menu__item" to="/Videos" reloadDocument={true}>
                Videos
            </Link>
            <Link className="menu__item" to="/Teachers" reloadDocument={true}>
                Teachers
            </Link>
            <Link className="menu__item" to="/Funders" reloadDocument={true}>
                Funders
            </Link>
            <Link className="menu__item" to="/Links" reloadDocument={true}>
                Links
            </Link>
            <Link className="menu__item" to="/Contact" reloadDocument={true}>
                Contact
            </Link>
        </div>
    );
}

export default Dropdown;
