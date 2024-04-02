import obiwan from '../assets/obiwan.jpg';

import error404Styles from "../css/Error404.module.css";

const Error404 = (props) => {

    const {search} = props;

    return (
        <div className={error404Styles.error404MainItem}>
            <h2 className={error404Styles.error404H2}>
            Error 404 - These aren't the droids you're looking for.
            </h2>
            <img src={obiwan} alt="Obi-Wan Kenobi's Jedi mind trick." className={error404Styles.error404Img} />
            <button onClick={() => search()} className={error404Styles.error404BlueButton}>
                These aren't the droids we are looking for.
            </button>
        </div>
    );
}

export default Error404;
