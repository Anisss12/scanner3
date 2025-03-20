"use client";

import React, { useState, useEffect } from "react";
import { Copy, Plus, Scan } from "lucide-react";
import { toast } from "sonner";
import styles from "./sample.module.css";

const ScanResult = ({ result, onAddToList, onScanAgain }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [unit, setUnit] = useState(0);

  useEffect(() => {
    const fetchingData = async () => {
      try {
        const response = await fetch("/api/saveData");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
        setFilteredData(result); // Initialize filtered data with all data
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchingData();
  }, []);

  useEffect(() => {
    // Filtering the data based on result
    const filtered = data.filter((item) =>
      item.barcode.toLowerCase().includes("48571035".toLowerCase())
    );
    setFilteredData(filtered);
  }, [result, data]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(result)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
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
                  <select>
                    {item.sizes.map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </li>
                <li>
                  <strong>Colors:</strong>
                  <select>
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
                    <label htmlFor="">Name:</label>
                    <input type="text" />
                  </div>
                  <div className={styles.mobile}>
                    <label htmlFor="">Mobile:</label>
                    <input type="number" />
                  </div>
                  <div className={styles.unit}>
                    <label htmlFor="">Unit:</label>
                    <input
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      type="number"
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

          <button onClick={onAddToList} className={styles.buttonSecondary}>
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
