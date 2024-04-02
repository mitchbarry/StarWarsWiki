import { useEffect, useState } from 'react';

import styles from "../css/Search.module.css";

import loading from '../assets/loading.gif';
import check from '../assets/check.png';
import home from '../assets/home.png';

const Search = (props) => {
    const { responseData,
            isLoading,
            search,
            selectedCategory,
            selectedItem,
            selectedCategoryUpdater,
            selectedItemUpdater,
            searchMethod,
            searchMethodUpdater
            } = props;

    const [showNotification, setShowNotification] = useState(true);
    const [errors, setErrors] = useState([]);
    const [itemOptions, setItemOptions] = useState(null);

    const inputHandler = (e) => {
        switch (e.target.id) {
            case "category":
                return categoryHandler(e);
            case "itemId":
            case "item":
                return itemHandler(e);
            case "byId":
            case "byList":
                return searchMethodHandler(e);
            default:
                return;
        }
    };

    const categoryHandler = (e) => {
        selectedCategoryUpdater(e.target.value);
    };

    const itemHandler = (e) => {
        if (e.target.id === "itemId" && searchMethod === "byId") {
            if (e.target.value < 1) {
                selectedItemUpdater(searchMethod,1);
            }
            else if (e.target.value > 82) {
                // Hardcoded check 2 of 2 for max id entry ensuring all entries are valid, could be changed to dynamic check once data is fetched from API.
                selectedItemUpdater(searchMethod,82);
            }
            else {
                selectedItemUpdater(searchMethod,e.target.value);
            }
        }
        if (e.target.id === "item" && searchMethod === "byList") {
            selectedItemUpdater(searchMethod,e.target.value);
        }
    };

    const searchMethodHandler = (e) => {
        searchMethodUpdater(e.target.value);
    };

    useEffect(() => {
        if (selectedCategory !== "" && responseData && responseData[selectedCategory]) {
            setItemOptions(responseData[selectedCategory].map((item) => item.name || item.title));
        }
    }, [selectedCategory, responseData]);

    const submitSearch = (e) => {
        e.preventDefault();
        let itemId;
        if (searchMethod === "byId") {
            itemId = selectedItem.byId
        }
        else {
            itemId = selectedItem.byList
        }
        if (selectedCategory !== "" && itemId !== "") {
            setErrors([]);
            setShowNotification(true);
            search(selectedCategory, itemId);
        }
        else if (selectedCategory !== "") {
            setErrors([]);
            setShowNotification(true);
            search(selectedCategory);
        }
        else if (itemId !== "") {
            setErrors([]);
            addError("Please select a category!");
        }
        else {
            addError("Please specify your search!");
        }
    };

    const addError = (message) => {
        setErrors((prevErrors) => {
            const updatedErrors = [...prevErrors];
            const existingError = updatedErrors.find(error => error.message === message);
            if (!existingError) {
                updatedErrors.push({message});
            }
            setShowNotification(true);
            return updatedErrors;
        });
    };

    const closeNotification = () => {
        setShowNotification(false);
    }

    return (
        <div className={styles.mainItem}>
            <pre>
                _                                 <br></br>
                ___| |_ __ _ _ __  __      ____ _ _ __ ___<br></br>
                / __| __/ _` | '__| \ \ /\ / / _` | '__/ __|<br></br>
                \__ \ || (_| | |     \ V  V / (_| | |  \__ \<br></br>
                |___/\__\__,_|_|      \_/\_/ \__,_|_|  |___/<br></br>
            </pre>
            {errors.length !== 0 && showNotification && (
                <ul className={styles.flashBox}>
                    <button className={styles.closeButton} onClick={() => closeNotification()}>x</button>
                    {errors.map((error, index) => (
                        <li key={index}>
                            {error.message}
                        </li>
                    ))}
                </ul>
            )}
            <div className={styles.flexBox}>
                {isLoading?(
                    <img src={loading} alt="Page Loading..." className={styles.loadingIcon}/>
                ):(
                    <img src={check} alt="Page Loaded!" className={styles.loadingIcon}/>
                )}
                <form className={styles.flexFormRow} onSubmit={(e) => submitSearch(e)}>
                    <label className={styles.bigLabel} htmlFor="category">
                        Search:
                    </label>
                    <div>
                        <div className={styles.flexFormLineAlignCenterJustifyEnd}>
                            <label htmlFor="byId" className={styles.smallLabel}>By ID:</label>
                            <input type="radio" id="byId" name="searchMethod" value="byId" className={styles.radioButton} onChange={(e) => inputHandler(e)} defaultChecked/>
                            <label htmlFor="byList" className={styles.smallLabel}>From List:</label>
                            <input type="radio" id="byList" name="searchMethod" value="byList" className={styles.radioButton} onChange={(e) => inputHandler(e)}/>
                        </div>
                        <div className={styles.flexFormLineAlignCenter}>
                            <select
                                defaultValue=""
                                id="category"
                                name="category"
                                onChange={(e) => inputHandler(e)}
                                className={styles.textfieldFitContent}
                            >
                                <option value="" disabled>
                                    -- Select a Category --
                                </option>
                                {responseData?.categories &&
                                    Object.keys(responseData.categories).map((keyName, index) => (
                                        <option value={keyName} key={index}>
                                            {keyName.charAt(0).toUpperCase() + keyName.slice(1)}
                                        </option>
                                    ))}
                            </select>
                            {searchMethod === "byId" ? (
                                <input type="number" id="itemId" name="itemId" className={styles.numberField60} placeholder="Enter an ID" value={selectedItem.byId} onChange={(e) => inputHandler(e)} ></input>
                            ) : (
                                <select
                                    defaultValue={selectedItem.byList}
                                    id="item"
                                    name="item"
                                    onChange={(e) => inputHandler(e)}
                                    className={styles.textfield60}
                                >
                                    <option value="" disabled>
                                        -- Select an Item --
                                    </option>
                                    {(itemOptions !== null) && itemOptions.map((name , index) => (
                                            <option value={index + 1} key={index}>
                                                {name}
                                            </option>
                                        ))
                                    }
                                </select>
                            )}
                        </div>
                    </div>
                    <button type="submit" className={styles.blueButtonMarginLeft}>
                        Submit
                    </button>
                </form>
                <img src={home} alt="Home button" className={styles.icon} onClick={() => search()}/>
            </div>
        </div>
    );
};

export default Search;
