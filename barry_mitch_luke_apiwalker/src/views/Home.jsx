import homeStyles from "../css/Home.module.css";

const Home = (props) => {
    const {responseData, search} = props;

    return (
        <div className={homeStyles.homeMainItem}>
            <p className={homeStyles.homeP}>
                /{'\u00A0'}<span className={homeStyles.homeBlueLinkItem} onClick={() => search()}>Home</span>{'\u00A0'}/
            </p>
            <h1 className={homeStyles.homeH1}>
                Categories
            </h1>
            <ul className={homeStyles.homeUl}>
                <li className={homeStyles.homeLi}>
                    <ul className={homeStyles.homeUl}>
                        {responseData && responseData.categories && Object.keys(responseData.categories).map((keyName, index) => (
                            <li key={index} className={homeStyles.homeLi} onClick={() => search(keyName)}>
                                <span className={homeStyles.homeBlueLinkItem}>{keyName.charAt(0).toUpperCase() + keyName.slice(1)}</span>
                            </li>
                        ))}
                    </ul>
                </li>
            </ul>
        </div>
    );
}

export default Home;
