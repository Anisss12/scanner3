"use client";

import React, { useState, useEffect } from "react";
import { Copy, Plus, Scan } from "lucide-react";
import { toast } from "sonner";
import styles from "./ScanResult.module.css";

const ScanResult = ({ result, onAddToList, onScanAgain }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [unit, setUnit] = useState(0);
  const [tradeData, setTradeData] = useState({
    barcode: "",
    design: "",
    sizes: "",
    colors: "",
    price: 0,
    total: 0,
    name: "",
    mobile: "",
  });

  useEffect(() => {
    const fetchingData = async () => {
      try {
        const response = await fetch("/api/saveData");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.data);
        setFilteredData(result.data); // Initialize filtered data with all data
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchingData();
  }, []);

  useEffect(() => {
    // Filtering the data based on result
    const filtered = data.filter((item) =>
      item.barcode.toLowerCase().includes(result.toLowerCase())
    );
    setFilteredData(filtered);

    if (filtered.length > 0) {
      const item = filtered[0];
      setTradeData((prevData) => ({
        ...prevData,
        barcode: item.barcode,
        design: item.design,
        price: item.price,
      }));
    }
  }, [result, data]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(result)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUnitChange = (e, price) => {
    const unitValue = e.target.value;
    setUnit(unitValue);
    setTradeData((prevData) => ({
      ...prevData,
      unit: unitValue,
      total: unitValue * price,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setTradeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddToList = () => {
    onAddToList(tradeData);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Result</h2>
      <div className={styles.resultBox}>
        <p className={styles.resultText}>{result}</p>
      </div>
      <div className={styles.entryResult}>
        <ul>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <ul key={index} className={styles.allResults}>
                <li>
                  <strong>Barcode:</strong> {item.barcode}
                </li>
                <li>
                  <strong>Design:</strong> {item.design}
                </li>
                <li>
                  <strong>Sizes:</strong>
                  <select
                    name="sizes"
                    value={tradeData.sizes}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select a size</option>
                    {item.sizes.map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </li>
                <li>
                  <strong>Colors:</strong>
                  <select
                    name="colors"
                    value={tradeData.colors}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select a color</option>
                    {item.colors.map((color, index) => (
                      <option key={index} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </li>
                <li>
                  <strong>Price:</strong> {item.price}
                </li>
                <div className={styles.addTradeDetails}>
                  <div className={styles.name}>
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={tradeData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.mobile}>
                    <label htmlFor="mobile">Mobile:</label>
                    <input
                      type="number"
                      name="mobile"
                      value={tradeData.mobile}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.unit}>
                    <label htmlFor="unit">Unit:</label>
                    <input
                      type="number"
                      name="unit"
                      value={unit}
                      onChange={(e) => handleUnitChange(e, item.price)}
                    />
                  </div>
                  <div className={styles.price}>
                    <h2>Total:</h2>
                    <h2>{item.price * unit}</h2>
                  </div>
                </div>
              </ul>
            ))
          ) : (
            <li>No data found</li>
          )}
        </ul>
      </div>
      <div className={styles.card}>
        <div className={styles.buttonGroup}>
          <button onClick={copyToClipboard} className={styles.buttonSecondary}>
            <Copy size={18} />
            <span>Copy</span>
          </button>

          <button onClick={handleAddToList} className={styles.buttonSecondary}>
            <Plus size={18} />
            <span>Add to List</span>
          </button>
        </div>

        <button onClick={onScanAgain} className={styles.buttonPrimary}>
          <Scan size={18} />
          <span>Scan Again</span>
        </button>
      </div>
    </div>
  );
};

export default ScanResult;
