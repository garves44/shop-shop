import React, { useEffect } from "react";
import {
  UPDATE_CATEGORIES,
  UPDATE_CURRENT_CATEGORY,
} from "../../utils/actions";
import { useQuery } from "@apollo/react-hooks";
import { QUERY_CATEGORIES } from "../../utils/queries";
// import { useStoreContext } from "../../utils/GlobalState";
import { useDispatch, useSelector } from "react-redux";
import { idbPromise } from "../../utils/helpers";

function CategoryMenu() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const { categories } = state;
  const { loading, data: categoryData } = useQuery(QUERY_CATEGORIES);

  useEffect(() => {
    //if there is categoryData to be stored
    if (categoryData) {
      //lets store it in the global state object
      dispatch({
        type: UPDATE_CATEGORIES,
        categories: categoryData.categories,
      });
      //but lets also take each category and save it to IndexedDB using the helper function being imported
      categoryData.categories.forEach((category) => {
        idbPromise("categories", "put", category);
      });
      //else if to check if 'loading' is undefined in 'useQuery()' hook
    } else if (!loading) {
      idbPromise("categories", "get").then((categories) => {
        dispatch({
          type: UPDATE_CATEGORIES,
          categories: categories,
        });
      });
    }
  }, [categoryData, loading, dispatch]);

  const handleClick = (id) => {
    dispatch({
      type: UPDATE_CURRENT_CATEGORY,
      currentCategory: id,
    });
  };

  return (
    <div>
      <h2>Choose a Category:</h2>
      {categories.map((item) => (
        <button
          key={item._id}
          onClick={() => {
            handleClick(item._id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryMenu;
