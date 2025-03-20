"use client";
import { useState, useEffect } from "react";
import React from "react";
import {
  FilePlus,
  Blocks,
  ScrollText,
  Boxes,
  IndianRupee,
  TableProperties,
} from "lucide-react";
import styles from "./HomeScreen.module.css";
import Link from "next/link";

const HomeScreen = ({ onShowForm }) => {
  const [data, setData] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState(0);

  useEffect(() => {
    // Load scanned items from localStorage
    const savedData = localStorage.getItem("scannedItems");

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setSavedItems(parsedData);

      // Correctly update price and unit using previous state values
      let totalPrice = 0;
      let totalUnits = 0;

      parsedData.forEach((item) => {
        totalPrice += item.price; // Assuming quantity means price sum
        totalUnits += item.quantity; // Assuming unit is a valid key
      });

      setPrice((prevPrice) => prevPrice + totalPrice);
      setUnit((prevUnit) => prevUnit + totalUnits);
    }

    console.log(savedData); // Logs the raw string from localStorage
  }, []); // Run once on mount

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/saveData", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.dashBoard}>
        <div className={styles.totalStock}>
          <h2>Total Stock</h2>
          <div className={styles.box}>
            <Blocks size={40} strokeWidth={1} />
            <h2>{data.length}</h2>
          </div>
        </div>
        <div className={styles.totalItemOrderd}>
          <h2>Item Order</h2>
          <div className={styles.box}>
            <ScrollText size={40} strokeWidth={1} />
            <h2>{savedItems.length}</h2>
          </div>
        </div>
        <div className={styles.totalUnitOrderd}>
          <h2>Unit Order</h2>
          <div className={styles.box}>
            <Boxes size={40} strokeWidth={1} />
            <h2>{unit}</h2>
          </div>
        </div>

        <div className={styles.totalRevenue}>
          <h2>Total Revenue</h2>
          <div className={styles.box}>
            <IndianRupee size={40} strokeWidth={1} />
            <h2>{price}</h2>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.addItem}>
          <FilePlus
            onClick={onShowForm}
            size={70}
            strokeWidth={1}
            className={styles.icon}
          />
          <h2 className={styles.title}>Add Details</h2>
        </div>
        <Link href={"/item"} className={styles.addItem}>
          <TableProperties size={64} strokeWidth={1} />
          <h2 className={styles.title}> Stock List</h2>
        </Link>
      </div>

      <div className={styles.textContainer}>
        <p className={styles.text}>Tap the add button above to add stock</p>
      </div>
    </div>
  );
};

export default HomeScreen;
