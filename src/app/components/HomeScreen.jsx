"use client";

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
  return (
    <div className={styles.container}>
      <div className={styles.dashBoard}>
        <div className={styles.totalStock}>
          <h2>Total Stock</h2>
          <div className={styles.box}>
            <Blocks size={40} strokeWidth={1} />
            <h2>50</h2>
          </div>
        </div>
        <div className={styles.totalItemOrderd}>
          <h2>Item Order</h2>
          <div className={styles.box}>
            <ScrollText size={40} strokeWidth={1} />
            <h2>50</h2>
          </div>
        </div>
        <div className={styles.totalUnitOrderd}>
          <h2>Unit Order</h2>
          <div className={styles.box}>
            <Boxes size={40} strokeWidth={1} />
            <h2>50</h2>
          </div>
        </div>

        <div className={styles.totalRevenue}>
          <h2>Total Revenue</h2>
          <div className={styles.box}>
            <IndianRupee size={40} strokeWidth={1} />
            <h2>97220</h2>
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
