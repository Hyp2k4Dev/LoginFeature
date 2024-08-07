import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/products/${id}`)
      .then((response) => {
        setName(response.data.name);
        setDescription(response.data.description);
        setPrice(response.data.price);
      })
      .catch((error) =>
        console.error("There was an error fetching the product!", error)
      );
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .put(`/api/products/${id}`, { name, description, price })
      .then(() => navigate("/products"))
      .catch((error) =>
        console.error("There was an error updating the product!", error)
      );
  };

  return (
    <div>
      <h1>Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <br />
        <label>
          Price:
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Update Product</button>
      </form>
    </div>
  );
};

export default EditProduct;
