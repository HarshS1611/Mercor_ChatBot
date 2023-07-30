import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import './Product.css';

const Product = () => {
  const { id } = useParams();
  console.log(id);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Function to fetch products data
    const fetchProducts = async () => {
      const options = {
        method: 'GET',
        url: 'https://wayfair.p.rapidapi.com/products/search',
        params: {
          keyword: id,
          sortby: '0',
          filters: 'fashion',
          curpage: '1',
          itemsperpage: '15'
        },
        headers: {
          'X-RapidAPI-Key': 'c2c16bd498mshbe8d539aec12942p166ddcjsn5b0358c7847f',
          'X-RapidAPI-Host': 'wayfair.p.rapidapi.com'
        }
      };
      
      try {
        const response = await axios.request(options);
        console.log(response.data.response.product_collection);
        setProducts(response.data.response.product_collection)
      } catch (error) {
        console.error(error);
      }
    };

    // Call the fetchProducts function
    fetchProducts();
  }, []);

  return (
    <div>
      <h1><b>Product List</b></h1>
      <ul className="products">
        {products ? (
           <div className="product-list">
           {products.map((product, index) => (
             <div className="product-card" key={index}>
               <img src={product.image_url} alt={product.list_price} />
               <div className="product-details">
                 <h4>Product: {product.name}</h4>
                 <p>Price: {product.list_price}</p>
                 <p>Minimum Offer Price: {product.formatted_lightning_deal_price}</p>
                 <p>Product Ratings: {product.average_overall_rating}</p>
                 <a href={product.product_url} target="_blank" rel="noopener noreferrer">
                   View on WayFair
                 </a>
               </div>
             </div>
           ))}
         </div>
        ) : (
          <>Loading...</>
        )}
      </ul>
    </div>
  );
};

export default Product;
