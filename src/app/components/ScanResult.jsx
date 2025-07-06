"use client";

import React, { useState, useEffect } from "react";
import { Copy, Plus, Scan } from "lucide-react";
import { toast } from "sonner";
import styles from "./ScanResult.module.css";

const ScanResult = ({ result, onAddToList, onScanAgain }) => {
  const [allData, setAllData] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [formStates, setFormStates] = useState([]); // One per scanned item

  // Fetch data once
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

  // Add scanned item to list
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
        setFormStates((prev) => [
          ...prev,
          {
            barcode: matched.barcode,
            design: matched.design,
            sizes: "",
            colors: "",
            price: matched.price,
            total: 0,
            name: "",
            mobile: "",
            unit: 0,
          },
        ]);
      }
    }
  }, [result, allData]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(result)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Copy failed"));
  };

  const handleInputChange = (index, name, value) => {
    const updated = [...formStates];
    updated[index][name] = value;
    setFormStates(updated);
  };

  const handleUnitChange = (index, value, price) => {
    const updated = [...formStates];
    const unit = parseInt(value) || 0;
    updated[index].unit = unit;
    updated[index].total = unit * price;
    setFormStates(updated);
  };

  const handleAddToList = (index) => {
    onAddToList(formStates[index]);
    toast.success("Item added to list");
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
                    value={formStates[index]?.sizes || ""}
                    onChange={(e) =>
                      handleInputChange(index, "sizes", e.target.value)
                    }
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
                    value={formStates[index]?.colors || ""}
                    onChange={(e) =>
                      handleInputChange(index, "colors", e.target.value)
                    }
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
                      value={formStates[index]?.name || ""}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.mobile}>
                    <label>Mobile:</label>
                    <input
                      type="number"
                      name="mobile"
                      value={formStates[index]?.mobile || ""}
                      onChange={(e) =>
                        handleInputChange(index, "mobile", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.unit}>
                    <label>Unit:</label>
                    <input
                      type="number"
                      name="unit"
                      value={formStates[index]?.unit || 0}
                      onChange={(e) =>
                        handleUnitChange(index, e.target.value, item.price)
                      }
                    />
                  </div>
                  <div className={styles.price}>
                    <h4>Total: {formStates[index]?.total || 0}</h4>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.buttonGroup}>
                    <button
                      onClick={() => copyToClipboard(item.barcode)}
                      className={styles.buttonSecondary}
                    >
                      <Copy size={18} />
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={() => handleAddToList(index)}
                      className={styles.buttonSecondary}
                    >
                      <Plus size={18} />
                      <span>Add to List</span>
                    </button>
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
        <button onClick={onScanAgain} className={styles.buttonPrimary}>
          <Scan size={18} />
          <span>Scan Again</span>
        </button>
      </div>
    </div>
  );
};

export default ScanResult;
