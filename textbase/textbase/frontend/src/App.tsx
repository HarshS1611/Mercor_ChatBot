import { useState, useRef, useEffect } from "react";
import React from "react";
import "./App.css";
import Product from "./Product.tsx";
import Chat from "./Chat.tsx";

import { BrowserRouter as Router, Routes,Route } from "react-router-dom";
function App() {
  return (
    <>
      <Router>
      <div>      

        <Routes>
          <Route  path="/" element={<Chat/>} />
          <Route  path="/product/:id" element={<Product/>} />
        </Routes>
      </div>
    </Router>
    </>
  );
}

export default App;
