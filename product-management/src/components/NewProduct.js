import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("/api/products", { name, description, price })
      .then(() => navigate("/products"))
      .catch((error) =>
        console.error("There was an error creating the product!", error)
      );
  };

  return (
    <div>
      <h1>New Product</h1>
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
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
};

export default NewProduct;
