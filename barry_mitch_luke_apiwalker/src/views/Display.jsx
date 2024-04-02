import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import displayStyles from "../css/Display.module.css";

const Display = (props) => {

    const { search, responseData, isLoadingUpdater }  = props;
    const { category, itemId } = useParams();
    const [loadedObject, setLoadedObject] = useState(null);
    const [apiNames, setApiNames] = useState({});

    const urlToCategory = (url) => {
        if (typeof url === "string") {
            const parts = url.split('/');
            const category = parts[parts.length - 3];
            return category;
        }
        else {
            console.error("Invalid URL:" + url);
        }
    };

    const urlToID = (url) => {
        if (typeof url === "string") {
            const parts = url.split('/');
            const id = parts[parts.length - 2];
            return id.replace('/', '');
        }
        else {
            console.error("Invalid URL:" + url);
        }
    };
    
    useEffect(() => {
        let newLoadedObject = null;
    
        if (responseData && responseData.categories) {
            if (itemId && responseData.categories[category]) {
                const categoryData = responseData.categories[category][itemId];
                if (categoryData && Object.keys(categoryData).length !== 0) {
                    newLoadedObject = categoryData;
                }
                else if (responseData[category]) {
                    newLoadedObject = responseData[category][itemId - 1];
                }
            } else if (responseData[category]) {
                newLoadedObject = responseData[category];
            }
        }
        setLoadedObject(newLoadedObject);
    }, [itemId, category, responseData]);

    useEffect(() => {
        const fetchApiNames = async () => {
            try {
                isLoadingUpdater(true);
                if (loadedObject && category && itemId) {
                    console.log("loaded object: ");
                    console.log(loadedObject);
                    console.log("category: " + category);
                    console.log("itemId: " + itemId);
                    const newData = {};
                    if (Array.isArray(loadedObject)) {
                        console.log(loadedObject);
                        for (const keyName in loadedObject[itemId - 1]) {
                            console.log("keyName: " + keyName);
                            const urls = Array.isArray(loadedObject[itemId - 1][keyName])
                                ? loadedObject[itemId - 1][keyName]
                                : [loadedObject[itemId - 1][keyName]];
                            for (const url of urls) {
                                console.log("url: ");
                                console.log(url);
                                if (typeof url === "string" && url.includes("https://")) {
                                    const category = urlToCategory(url);
                                    const id = urlToID(url);
                                    if (apiNames && category && id) {
                                        const response = await axios.get(url);
                                        if (!(category in newData)) {
                                            newData[category] = { [id]: response.data.name || response.data.title };
                                        } else {
                                            newData[category][id] = response.data.name || response.data.title;
                                        }
                                    }
                                }
                            }
                        }
                    } else if (!Array.isArray(loadedObject)) {
                        for (const keyName in loadedObject) {
                            console.log(`loaded object[${keyName}] on line 153: `);
                            console.log(loadedObject[keyName]);
                            const urls = Array.isArray(loadedObject[keyName])
                                ? loadedObject[keyName]
                                : [loadedObject[keyName]];
                            for (const url of urls) {
                                if (typeof url === "string" && url.includes("https://")) {
                                    const category = urlToCategory(url);
                                    const id = urlToID(url);
                                    if (apiNames && category && id) {
                                        const response = await axios.get(url);
                                        if (!(category in newData)) {
                                            newData[category] = { [id]: response.data.name || response.data.title };
                                        } else {
                                            newData[category][id] = response.data.name || response.data.title;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    setApiNames((prevApiNames) => ({ ...prevApiNames, ...newData }));
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                isLoadingUpdater(false);
                console.log("Loading finished!")
            }
        };
        fetchApiNames();
    }, [loadedObject, itemId, category]);

    return (
        <div className={displayStyles.displayMainItem}>
            <p className={displayStyles.displayP}>
                /{'\u00A0'}
                <span className={displayStyles.displayBlueLinkItem} onClick={() => search()}>Home</span>
                {'\u00A0'}/{'\u00A0'}
                <span className={displayStyles.displayBlueLinkItem} onClick={() => search(category)}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                {'\u00A0'}/{'\u00A0'}
                {itemId && (
                    <span className={displayStyles.displayBlueLinkItem} onClick={() => search(category, itemId)}>
                        {itemId}{'\u00A0'}:{'\u00A0'}
                        {loadedObject !== null &&
                            (Array.isArray(loadedObject)
                                ? loadedObject[itemId - 1]?.name || loadedObject[itemId - 1]?.title
                                : loadedObject.name || loadedObject.title)}
                    </span>
                )}
            </p>
            <h1 className={displayStyles.displayH1}>
                {itemId
                    ? (loadedObject !== null && (
                        Array.isArray(loadedObject)
                            ? loadedObject[itemId - 1]?.name || loadedObject[itemId - 1]?.title
                            : loadedObject.name || loadedObject.title
                    ))
                    : category.charAt(0).toUpperCase() + category.slice(1)}
            </h1>
            {itemId && loadedObject !== null && (
                <ul className={displayStyles.displayUl}>
                    {Array.isArray(loadedObject) ? (
                        loadedObject[itemId - 1] && Object.keys(loadedObject[itemId - 1]).map((keyName, index) => (
                            !["name", "title", "created", "edited", "url", "episode_id"].includes(keyName) &&
                            (Array.isArray(loadedObject[itemId - 1][keyName]) ? loadedObject[itemId - 1][keyName].length !== 0 : loadedObject[itemId - 1][keyName] !== "") && (
                                <li key={index} className={displayStyles.displayLi1}>
                                    <b>{keyName
                                        .replace(/_/g, ' ')
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ')}
                                    </b>
                                    {'\u00A0'}:{'\u00A0'}
                                    {loadedObject[itemId - 1][keyName] !== null && !(Array.isArray(loadedObject[itemId - 1][keyName])) ? (
                                        loadedObject[itemId - 1][keyName].includes("https://") ? (
                                            <span className={displayStyles.displayBlueLinkItem} onClick={() => search(urlToCategory(loadedObject[itemId - 1][keyName]), urlToID(loadedObject[itemId - 1][keyName]))}>
                                                {apiNames && (
                                                    apiNames[urlToCategory(loadedObject[itemId - 1][keyName])] && (
                                                        apiNames[urlToCategory(loadedObject[itemId - 1][keyName])][urlToID(loadedObject[itemId - 1][keyName])] && (
                                                            apiNames[urlToCategory(loadedObject[itemId - 1][keyName])][urlToID(loadedObject[itemId - 1][keyName])]
                                                        )
                                                    )
                                                )}
                                            </span>
                                        ) : (
                                            <span>{loadedObject[itemId - 1][keyName]}</span>
                                        )
                                    ) : (loadedObject[itemId - 1][keyName] !== null && Array.isArray(loadedObject[itemId - 1][keyName]) &&  (
                                        <ul className={displayStyles.displayUl}>
                                            {apiNames && (
                                                loadedObject[itemId - 1][keyName].map((url, index) => (
                                                    <li key={index} className={index === 0 ? displayStyles.displayLi3 : displayStyles.displayLi2}>
                                                        <span className={displayStyles.displayBlueLinkItem} onClick={() => search(urlToCategory(url), urlToID(url))}>
                                                            {apiNames[urlToCategory(url)] && (
                                                                    apiNames[urlToCategory(url)][urlToID(url)] && (
                                                                        apiNames[urlToCategory(url)][urlToID(url)]
                                                                    )
                                                                )
                                                            }
                                                        </span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                        )
                                    )}
                                </li>
                            )
                        ))
                    ) : (
                        loadedObject && Object.keys(loadedObject).map((keyName, index) => (
                            !["name", "title", "created", "edited", "url", "episode_id"].includes(keyName) && (
                                (Array.isArray(loadedObject[keyName]) ? loadedObject[keyName].length !== 0 : loadedObject[keyName] !== "") && (
                                    <li key={index} className={displayStyles.displayLi1}>
                                        <b>{keyName
                                            .replace(/_/g, ' ')
                                            .split(' ')
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(' ')}
                                        </b>
                                        {'\u00A0'}:{'\u00A0'}
                                        {loadedObject[keyName] !== null && !(Array.isArray(loadedObject[keyName])) ? (
                                            loadedObject[keyName].includes("https://") ? (
                                                <span className={displayStyles.displayBlueLinkItem} onClick={() => search(urlToCategory(loadedObject[keyName]), urlToID(loadedObject[keyName]))}>
                                                    {apiNames && (
                                                        apiNames[urlToCategory(loadedObject[keyName])] && (
                                                            apiNames[urlToCategory(loadedObject[keyName])][urlToID(loadedObject[keyName])] && (
                                                                apiNames[urlToCategory(loadedObject[keyName])][urlToID(loadedObject[keyName])]
                                                            )
                                                        )
                                                    )}
                                                </span>
                                            ) : (
                                                <span>{loadedObject[keyName]}</span>
                                            )
                                        ) : (loadedObject[keyName] !== null && Array.isArray(loadedObject[keyName]) && (
                                            <ul className={displayStyles.displayUl}>
                                                {apiNames && (
                                                    loadedObject[keyName].map((url, index) => (
                                                        <li key={index} className={index === 0 ? displayStyles.displayLi3 : displayStyles.displayLi2}>
                                                            <span className={displayStyles.displayBlueLinkItem} onClick={() => search(urlToCategory(url), urlToID(url))}>
                                                                {apiNames[urlToCategory(url)] && (
                                                                        apiNames[urlToCategory(url)][urlToID(url)] && (
                                                                            apiNames[urlToCategory(url)][urlToID(url)]
                                                                        )
                                                                    )}
                                                            </span>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                            )
                                        )}
                                    </li>
                                )
                            )
                        ))
                    )}
                </ul>
            )}
            {!itemId && loadedObject !== null && (
                <ol className={displayStyles.displayOl}>
                    {Array.isArray(loadedObject) && (
                        loadedObject.map((object, index) => (
                            <li key={index} className={displayStyles.displayLi1} onClick={() => search(category, index + 1)}>
                                <span className={displayStyles.displayBlueLinkItemOl}>
                                    {(object.name || object.title)}
                                </span>
                            </li>
                        ))
                    )}
                </ol>
            )}
        </div>
    );
}

export default Display;