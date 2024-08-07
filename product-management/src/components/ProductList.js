import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products")
      .then((response) => setProducts(response.data))
      .catch((error) =>
        console.error("There was an error fetching the products!", error)
      );
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <Link to="/products/new">Add New Product</Link>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            <Link to={`/products/${product._id}`}>{product.name}</Link>(
            <Link to={`/products/${product._id}/edit`}>Edit</Link>)
            <button onClick={() => handleDelete(product._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );

  function handleDelete(id) {
    axios
      .delete(`/api/products/${id}`)
      .then(() => setProducts(products.filter((product) => product._id !== id)))
      .catch((error) =>
        console.error("There was an error deleting the product!", error)
      );
  }
};

export default ProductList;
