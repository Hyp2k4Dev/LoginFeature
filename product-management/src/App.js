import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProductList from "./components/ProductList";
import NewProduct from "./components/NewProduct";
import EditProduct from "./components/EditProduct";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<NewProduct />} />
        <Route path="/products/:id/edit" element={<EditProduct />} />
      </Routes>
    </Router>
  );
};

export default App;
