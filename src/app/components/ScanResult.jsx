"use client";

import React, { useState, useEffect } from "react";
import { Copy, Plus, Scan } from "lucide-react";
import { toast } from "sonner";
import styles from "./ScanResult.module.css";

const ScanResult = ({ result, onAddToList, onScanAgain }) => {
  const [allData, setAllData] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [tradeData, setTradeData] = useState({});
  const [unit, setUnit] = useState(0);

  // fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/saveData");
        const json = await response.json();
        setAllData(json.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // add scanned item to list on each result change
  useEffect(() => {
    if (!result || !allData.length) return;

    const matched = allData.find((item) =>
      item.barcode.toLowerCase().includes(result.toLowerCase())
    );

    if (matched) {
      const alreadyExists = scannedItems.some(
        (item) => item.barcode === matched.barcode
      );
      if (!alreadyExists) {
        setScannedItems((prev) => [...prev, matched]);
        setTradeData({
          barcode: matched.barcode,
          design: matched.design,
          sizes: "",
          colors: "",
          price: matched.price,
          total: 0,
          name: "",
          mobile: "",
          unit: 0,
        });
        setUnit(0);
      }
    }
  }, [result, allData]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(result)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Copy failed"));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUnitChange = (e, price) => {
    const unitVal = parseInt(e.target.value) || 0;
    setUnit(unitVal);
    setTradeData((prev) => ({
      ...prev,
      unit: unitVal,
      total: unitVal * price,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setTradeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToList = () => {
    onAddToList(tradeData);
    toast.success("Item added to list");

    // Resetting size/color/unit only (keep barcode info)
    setTradeData((prev) => ({
      ...prev,
      sizes: "",
      colors: "",
      unit: 0,
      total: 0,
    }));
    setUnit(0);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Scan Result</h2>
      <div className={styles.resultBox}>
        <p className={styles.resultText}>{result}</p>
      </div>

      <div className={styles.entryResult}>
        <ul>
          {scannedItems.length > 0 ? (
            scannedItems.map((item, index) => (
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
                    <option value="">Select size</option>
                    {item.sizes.map((size, i) => (
                      <option key={i} value={size}>
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
                    <option value="">Select color</option>
                    {item.colors.map((color, i) => (
                      <option key={i} value={color}>
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
                    <label>Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={tradeData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.mobile}>
                    <label>Mobile:</label>
                    <input
                      type="number"
                      name="mobile"
                      value={tradeData.mobile}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles.unit}>
                    <label>Unit:</label>
                    <input
                      type="number"
                      name="unit"
                      value={unit}
                      onChange={(e) => handleUnitChange(e, item.price)}
                    />
                  </div>
                  <div className={styles.price}>
                    <h4>Total: {item.price * unit}</h4>
                  </div>
                </div>
              </ul>
            ))
          ) : (
            <li>No items scanned yet</li>
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
