import React, { useState, useEffect, useRef } from "react";
import "./styles.css";
import useDebounce from "./useDebounce";

const App = () => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [display, setDisplay] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const wrapperRef = useRef(null);

  const debouncedSearchTerm = useDebounce(search, 500);

  useEffect(
    () => {
      const searchBooks = () => {
        setDisplay(true);
        return fetch(
          `https://www.googleapis.com/books/v1/volumes?country=US&projection=lite&printType=books&key=AIzaSyD6SlU9JUr7Z-3SOOy0TfZTJtqv_EEqfZY&q=intitle:${debouncedSearchTerm}&startIndex=0&maxResults=10`
        ).then((res) => res.json());
      };
      if (debouncedSearchTerm) {
        setIsSearching(true);
        searchBooks(debouncedSearchTerm).then((results) => {
          setIsSearching(false);
          setOptions(results.items);
        });
      } else {
        setOptions([]);
      }
    },
    [debouncedSearchTerm] // Only call effect if debounced search term changes
  );

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleClickOutside = (event) => {
    const { current: wrap } = wrapperRef;
    if (wrap && !wrap.contains(event.target)) {
      setDisplay(false);
    }
  };
  const onChange = (e) => {
    setSearch(e.target.value);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      setActiveSuggestion(0);
      setDisplay(false);
      setSearch(options[activeSuggestion].volumeInfo.title);
    } else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }

      setActiveSuggestion(activeSuggestion - 1);
    } else if (e.keyCode === 40) {
      if (options.length - 1 === activeSuggestion) {
        return;
      }

      setActiveSuggestion(activeSuggestion + 1);
    }
  };

  useEffect(() => {
    console.log(options);
  }, [options]);

  //returns results & bolds the words that match search-query
  const boldSearch = (item, i) => {
    const onClick = (e) => {
      setSearch(e.currentTarget.innerText);
      setDisplay(false);
    };

    let option = item.volumeInfo.title;
    let link = item.selfLink;
    let id = item.id;

    let className;
    if (i === activeSuggestion) {
      className = "result selected";
    } else {
      className = "result";
    }

    if (search) {
      let index = option.toLowerCase().indexOf(search.toLowerCase());

      if (index !== -1) {
        let length = search.length;

        let prefix = option.substring(0, index);
        let suffix = option.substring(index + length);
        let match = option.substring(index, index + length);

        // Flag the active suggestion with a class

        return (
          <div className={className} key={id}>
            <span className="bookName" onClick={onClick}>
              {prefix}
              <span className="search">{match}</span>
              {suffix}
            </span>
            <a href={link}>>> more info</a>
          </div>
        );
      }
    }
    return (
      <div className={className} key={id}>
        <span onClick={onClick} className="bookName">
          {option}
        </span>
        <a href={link}>+</a>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="container" ref={wrapperRef}>
        <input
          placeholder="Search Books..."
          type="text"
          name="search"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={search}
          onClick={() => {
            setDisplay(true);
          }}
        />
        {options && display ? (
          <div className="options-container">
            {isSearching && (
              <div className="result searching">searching...</div>
            )}
            {options.map((option, i) => boldSearch(option, i))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default App;

