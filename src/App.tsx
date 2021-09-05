import React, { useState, useEffect, useRef, useReducer, useCallback, memo, useMemo } from 'react';
import axios from 'axios';
// import styled from 'styled-components';
// import styles from './App.module.css';
// import cs from 'classnames';
import './App.css';
// import CheckIcon from '@material-ui/icons/Check';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

/* const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;

  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);

  color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
`;

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const StyledColumn = styled.span`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  a {
    color: inherit;
  }

   width: ${(props) => props.width};
`;

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;

  transition: all 0.1s ease-in;

  &: hover {
    background: #171212;
    color: #ffffff;
  }

  &: hover > svg > g {
    fill: #ffffff;
    stroke: #ffffff;
  }
`;

const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;

const StyledLabel = styled.label`
  border-top: 1px solid #171212;
  border-left: 1px solid #171212;
  padding-left: 5px;
  font-size: 24px;
`;

const StyledInput = styled.input`
  border: none;
  border-bottom: 1px solid #171212;
  background-color: transparent;

  font-size: 24px;
`; */

/* const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1
  }
];

const getAsyncStories = () =>
  new Promise((resolve) => setTimeout(() => resolve({ data: { stories: initialStories } }), 2000)); */

  type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
  }

  type Stories = Array<Story>;

  type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
  }

  type StoriesState = {
    data: Stories;
    isLoading: boolean;
    isError: boolean;
  }

  type StoriesAction = 
   | StoriesFetchInitAction
   | StoriesFetchSuccessAction
   | StoriesFetchFailureAction
| StoriesRemoveAction;

  interface StoriesFetchInitAction {
    type: 'STORIES_FETCH_INIT';
  }

  interface StoriesFetchSuccessAction {
    type: 'STORIES_FETCH_SUCCESS';
    payload: Stories;
  }

  interface StoriesFetchFailureAction {
    type: 'STORIES_FETCH_FAILURE';
  }

  interface StoriesRemoveAction {
    type: 'REMOVE_STORY';
    payload: Story;
  }

const useSemiPersistentState = (key: string, initialState: string): [string, (newValue: string) => void] => {
  const isMounted = useRef(false);

  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      // console.log('A');
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter((story) => action.payload.objectID !== story.objectID)
      };
    default:
      throw new Error();
  }
  /* if (action.type === 'SET_STORIES') {
    return action.payload;
  } else if (action.type === 'REMOVE_STORY') {
    return state.filter((story) => action.payload.objectID !== story.objectID);
  } else {
    throw new Error();
  } */
};

const getSumComments = (stories: { isLoading?: boolean; isError?: boolean; data: any; }) => {
  console.log('C');

  return stories.data.reduce((result: any, value: { num_comments: any; }) => result + value.num_comments, 0);
};

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);
  // const [isLoading, setIsLoading] = useState(false);
  // const [isError, setIsError] = useState(false);

  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false
  });
  // note: action.type is the state condition, action.payload is the value of the new state

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({ type: 'STORIES_FETCH_SUCCESS', payload: result.data.hits });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item: Story) => {
    // const newStories = stories.filter((story) => item.objectID !== story.objectID);

    dispatchStories({ type: 'REMOVE_STORY', payload: item });
  };

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  };

  /*  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  ); */

  console.log('B:App');

  const sumComments = useMemo(() => getSumComments(stories), [stories]);

  return (
    <div className="container">
      <h1 className="headline-primary">My Hacker Stories with {sumComments} comments.</h1>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading ... </p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>)=>void;
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }: SearchFormProps) => (
  <form onSubmit={onSearchSubmit} className="search-form">
    <InputWithLabel id="search" isFocused onInputChange={onSearchInput} value={searchTerm}>
      <strong>Search: </strong>
    </InputWithLabel>

    <button className="button button_large" type="submit" disabled={!searchTerm}>
      Submit
    </button>
  </form>
);

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>)=>void;
  isFocused: boolean;
  children: React.ReactNode;
}

const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children }: InputWithLabelProps) => {
  // A
  const inputRef = useRef<HTMLInputElement>(null!);

  // X
  useEffect(() => {
    if (isFocused && inputRef.current) {
      // D
      inputRef.current.focus();
    }
  }, [isFocused]);
  return (
    <>
      <label htmlFor={id} className="label">
        {children}
      </label>
      <input className="input" ref={inputRef} id={id} type={type} onChange={onInputChange} value={value} />

      {/* <p>
        Searching for <strong>{value}</strong>
      </p> */}
    </>
  );
};

const List = 
  ({ list, onRemoveItem }: ListProps) =>(
    <>
    {list.map((item) => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />)}</>)


type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
}

const Item = ({ item, onRemoveItem }: ItemProps) => {
  function handleRemoveItem() {
    onRemoveItem(item);
  }
  return (
    <div className="item">
      <span style={{ width: '40%' }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: '30%' }}>{item.author}</span>
      <span style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
      <span style={{ width: '10%' }}>
        <button className="button button_small" type="button" onClick={handleRemoveItem}>
          {/* <CheckIcon size="sm" /> */} Dismiss
        </button>
      </span>
    </div>
  );
};

export default App;
