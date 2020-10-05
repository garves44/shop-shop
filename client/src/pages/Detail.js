import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { QUERY_PRODUCTS } from "../utils/queries";
import spinner from "../assets/spinner.gif";
// import { useStoreContext } from "../utils/GlobalState";
import {
  UPDATE_CATEGORIES,
  UPDATE_PRODUCTS,
  REMOVE_FROM_CART,
  ADD_TO_CART,
  UPDATE_CART_QUANTITY,
} from "../utils/actions";
import Cart from "../components/Cart";
import CartItem from "../components/CartItem";
import { idbPromise } from "../utils/helpers";
import { useDispatch, useSelector } from "react-redux";

function Detail() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const { id } = useParams();
  const [currentProduct, setCurrentProduct] = useState({});
  const { loading, data } = useQuery(QUERY_PRODUCTS);
  const { products, cart } = state;

  const addToCart = () => {
    const itemInCart = cart.find((CartItem) => CartItem._id === id);

    if (itemInCart) {
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1,
      });
      //if we're updating quantity, use existing item data and increment purchaseQuantity value by one
      idbPromise("cart", "put", {
        ...itemInCart,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1,
      });
    } else {
      dispatch({
        type: ADD_TO_CART,
        product: { ...currentProduct, purchaseQuantity: 1 },
      });
      //if product isn't in the cart yet, add it to the current shopping cart in IndexedDB
      idbPromise("cart", "put", { ...currentProduct, purchaseQuantity: 1 });
    }
  };

  const removeFromCart = () => {
    dispatch({
      type: REMOVE_FROM_CART,
      _id: currentProduct._id,
    });
    //if removing items from fart, delete the item from IndexedDB using the 'currentProduct._id' to locate what to remove
    idbPromise("cart", "delete", { ...currentProduct });
  };

  useEffect(() => {
    //if there are any products set it to the local state 'currentProduct'
    if (products.length) {
      setCurrentProduct(products.find((product) => product._id === id));
      //if there is any data to be stored
    } else if (data) {
      //lets store it in the global state object
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products,
      });

      //lets also take each product and save it to IndexedDB using help function being imported
      data.products.forEach((product) => {
        idbPromise("products", "put", product);
      });
      //else if to check if 'loading' is undefined by 'useQuery()' hook
    } else if (!loading) {
      //since we offline, get all of the data from the 'products' store
      idbPromise("promise", "get").then((indexedProducts) => {
        dispatch({
          type: UPDATE_PRODUCTS,
          products: indexedProducts,
        });
      });
    }
  }, [products, data, loading, dispatch, id]);

  return (
    <>
      {currentProduct ? (
        <div className="container my-1">
          <Link to="/">← Back to Products</Link>

          <h2>{currentProduct.name}</h2>

          <p>{currentProduct.description}</p>

          <p>
            <strong>Price:</strong>${currentProduct.price}{" "}
            <button onClick={addToCart}>Add to Cart</button>
            <button
              disabled={!cart.find((p) => p._id === currentProduct._id)}
              onClick={removeFromCart}
            >
              Remove from Cart
            </button>
          </p>

          <img
            src={`/images/${currentProduct.image}`}
            alt={currentProduct.name}
          />
        </div>
      ) : null}
      {loading ? <img src={spinner} alt="loading" /> : null}
      <Cart />
    </>
  );
}

export default Detail;
