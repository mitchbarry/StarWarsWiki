import { Routes,Route,useLocation } from 'react-router-dom';
import { useState,useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import Search from "./Search"
import Display from "../views/Display"
import Home from "../views/Home"
import Error404 from "../views/Error404"

import styles from "../css/Container.module.css";

/*
    Welcome to my Star Wars App.
    Leaving this here just before submitting this behemoth app.
    The project is far from "complete", I've achieved the functionality I wanted with a few extra features.
    Currently the website needs fixed/tuned;
        1. Loading times - They are excessive because of numerous API calls made to fetch all of the names/titles of the urls referenced in the original API call.
            - loading wheel is also inaccurate because of a couple useEffect hooks in the app that should be combined into one.
            - checking the responseData before making the API call(s) is one solution for this as the user explores the website but does nothing for the initial load.
            - apiNames should be a state variable here, in the container, to allow it to be used in the split Display.jsx components.
        2. Occasional Inconsistency - Its hard to tell without accurate loading information but it feels like sometimes a path wont correctly render all of the information.
            - The information that gets skipped seems to only be the links, everything else works consistently.
            - Breaking up the Display Component and simplifying code in general could be the solution to this.
        3. Display.jsx Component - this single component should be split up into at least two components, one for displaying a single item's information and one for displaying categories such as "people"
        4. API name fetching - Currently the app is set up to fetch the entire object for each person when all that is needed is the name/title.
            - testing is needed to determine if fetching just the name/title would result in less load time (because the api doesn't offer a list of names of people, it only offers all of the people objects in a list, people.)
    Additions I'd like to eventually include;
        1. Styling more specific to the Star Wars universe with more images and relevant color schemes
            a. Also making the website more modern looking, referencing other popular websites or using a css kit such as bootstrap.
        2. Research into calling on additional APIs such as an image search, Wikipedia or otherwise website.
        3. Even more dynamic rendering: after discussing my App in a 1 : 1 with Instructor Caden Wilcox, he recommended to look into;
            a. Conditional Css Styling based on the screen size, etc. Making the app more mobile friendly, etc.
            b. Dynamic Error.jsx Component that is capable of displaying a number of errors besides just error 404.
            c. API calls made using an onScroll event to display information at the top of the page until the user scrolls down wanting to see more.
            d. Possible rendering in a grid format, not just a vertical list.
        4. Adding units to the information contained within the primary API calls.
        5. Cleaning up the left over console.logs mainly found in the Display.jsx component.
        6. Including a sidebar that is used for something(?).
            a. Possibly a "Popular" section that shows the page with the most visits.
        7. About information.
        8. Credits to the APIs information.
        9. Horizontal bar on the top of the page for navigation.
        10. Horizontal dynamic loading bar on the top of the page. (referencing OP.GG)
        11. Ability to filter results and compare values of different object (Longest vehicle) (Smallest Planet)
        12. Inclusion of a database to store frequently accessed pages or information.
        13. ???

        Thanks for viewing my project! B)
*/

const Container = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [responseData, setResponseData] = useState({});
    const [selectedCategory,setSelectedCategory] = useState("");
    const [selectedItem,setSelectedItem] = useState({byId : "", byList : ""});
    const [isLoading, setIsLoading] = useState(false);
    const [searchMethod, setSearchMethod] = useState("byId");

    const selectedCategoryUpdater = (selectedCategory) => {
        setSelectedCategory(() => selectedCategory);
    }

    const selectedItemUpdater = (searchMethod, newSelectedItem) => {
        setSelectedItem((prevSelectedItem) => ({
            ...prevSelectedItem,
            [searchMethod]: newSelectedItem
        }));
    };

    const isLoadingUpdater = (newIsLoading) => {
        setIsLoading(() => newIsLoading)
    }

    const searchMethodUpdater = (newSearchMethod) => {
        setSearchMethod(() => newSearchMethod)
    }

    const search = (category, id) => {
        let path = "";
        if (category && id) {
            path = `/${category}/${id}`;
        }
        else if (category) {
            path = `/${category}`;
        }
        else {
            navigate("/search");
            return;
        }
        if (pathValidator(path)) {
            navigate(path);
        }
    };
    
    const pathValidator = (path) => {
        const pathSegments = path.split('/');
        const category = pathSegments[1];
        const itemId = pathSegments[2];
        // Hardcoded check 1 of 2 for category names in the url, could be changed to dynamic check once data is fetched from API.
        const isValidCategory = ["people", "planets", "films", "species", "vehicles", "starships"].includes(category);
        const isValidItemId = itemId !== undefined && !isNaN(itemId);
        // Some links within the API reference vehicles outside of the range of the list of vehicles provided at https://swapi.dev/api/vehicles. The highest ID I found was 76 while the list only goes up to 39.
        if ((category && itemId) && (category === "vehicles" && itemId > 39)) {
            return false
        }
        return isValidCategory && (isValidItemId || itemId === undefined);
    };

    useEffect(() => {
        if (location.pathname === "/") {
            navigate("/search");
        }
        else if (location.pathname.toLowerCase() === "/search") {
            navigate("/search");
        }
        else if (!pathValidator(location.pathname)) {
            navigate("/error404");
        }
    }, [location.pathname]);

    useEffect(() => {
        if (selectedCategory !== "" && !(selectedCategory in responseData) && searchMethod === "byList") {
            const fetchData = async () => {
                try {
                    isLoadingUpdater(true);
                    if (!(selectedCategory in responseData)) {
                        const response = await axios.get(`https://swapi.dev/api/${selectedCategory}`);
                        let nextPage = response.data.next;
                        let allResults = [...response.data.results];
                        while (nextPage) {
                            const nextPageResponse = await axios.get(nextPage);
                            allResults = [...allResults, ...nextPageResponse.data.results];
                            nextPage = nextPageResponse.data.next;
                        }
                        setResponseData((prevData) => ({
                            ...prevData,
                            [selectedCategory]: allResults,
                            categories: {
                                ...prevData.categories,
                                [selectedCategory]: null,
                            },
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching data: ", error);
                } finally {
                    isLoadingUpdater(false);
                }
            };
            fetchData();
        }
    },[selectedCategory,searchMethod])

    useEffect(() => {
        if (responseData.categories === undefined) {
            try {
                isLoadingUpdater(true);
                axios.get('https://swapi.dev/api/')
                    .then(response => {
                        const initialCategories = Object.fromEntries(
                            Object.keys(response.data).map(category => [category, {}])
                        );
                        setResponseData(() => ({
                            categories: initialCategories
                        }));
                    })
                    .catch(error => {
                        console.error("Error fetching data: ", error);
                    })
                    .finally(() => {
                        isLoadingUpdater(false);
                    });
            } catch (error) {
                console.error("Error in useEffect: ", error);
            }
        }
        if (pathValidator(location.pathname) && responseData.categories) {
            const pathSegments = location.pathname.split('/');
            const category = pathSegments[1];
            const itemId = pathSegments[2];
            if (itemId !== undefined) {
                const fetchData = async () => {
                    try {
                        isLoadingUpdater(true);
                        if (!(category in responseData) && (!(itemId in responseData.categories[category]))) {
                            const response = await axios.get(`https://swapi.dev/api/${category}/${itemId}`);
                            setResponseData((prevData) => ({
                                ...prevData,
                                categories: {
                                    ...prevData.categories,
                                    [category]: {
                                        ...(prevData.categories[category] || {}),
                                        [itemId]: response.data,
                                    },
                                },
                            }));
                        }
                    } catch (error) {
                        console.error("Error fetching data: ", error);
                    } finally {
                        isLoadingUpdater(false);
                    }
                };
                fetchData();
            } else {
                const fetchData = async () => {
                    try {
                        isLoadingUpdater(true);
                        if (!(category in responseData)) {
                            const response = await axios.get(`https://swapi.dev/api/${category}`);
                            let nextPage = response.data.next;
                            let allResults = [...response.data.results];
                            while (nextPage) {
                                const nextPageResponse = await axios.get(nextPage);
                                allResults = [...allResults, ...nextPageResponse.data.results];
                                nextPage = nextPageResponse.data.next;
                            }
                            setResponseData((prevData) => ({
                                ...prevData,
                                [category]: allResults,
                                categories: {
                                    ...prevData.categories,
                                    [category]: null,
                                },
                            }));
                        }
                    } catch (error) {
                        console.error("Error fetching data: ", error);
                    } finally {
                        isLoadingUpdater(false);
                    }
                };
                fetchData();
            }
        }
    }, [location.pathname, responseData.categories]);

    return (
        <div className={styles.container}>
            <Search isLoading={isLoading}
                    search={search}
                    responseData={responseData}
                    selectedCategory={selectedCategory}
                    selectedItem={selectedItem}
                    selectedCategoryUpdater={selectedCategoryUpdater}
                    selectedItemUpdater={selectedItemUpdater}
                    searchMethod={searchMethod}
                    searchMethodUpdater={searchMethodUpdater}/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Home responseData={responseData} search={search}/>} />
                <Route path="/error404" element={<Error404 search={search}/>}/>
                <Route path="/:category/:itemId?" element={<Display search={search} responseData={responseData} isLoadingUpdater={isLoadingUpdater}/>} />
                <Route path="*" element={<Error404 search={search}/>}/>
            </Routes>
        </div>
    )
}

export default Container;