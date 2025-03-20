"use client";

import React from "react";
import { Home, Image, QrCode, List } from "lucide-react";
import styles from "./TabBar.module.css";

const TabBar = ({ activeTab, onChangeTab }) => {
  return (
    <div className={styles.tabBar}>
      <div
        className={styles.activeTab}
        style={{
          transform: `translateX(calc(${
            activeTab === "home"
              ? "0"
              : activeTab === "upload"
              ? "100%"
              : activeTab === "scan"
              ? "200%"
              : "300%"
          } + ${
            activeTab === "home"
              ? "0"
              : activeTab === "upload"
              ? "0"
              : activeTab === "scan"
              ? "0"
              : "0"
          }px))`,
        }}
      ></div>

      <button
        onClick={() => onChangeTab("home")}
        className={`${styles.tabButton} ${
          activeTab === "home"
            ? styles.tabButtonActive
            : styles.tabButtonInactive
        }`}
      >
        <Home size={24} className={styles.icon} />
        <span className={styles.label}>Home</span>
      </button>

      <button
        onClick={() => onChangeTab("upload")}
        className={`${styles.tabButton} ${
          activeTab === "upload"
            ? styles.tabButtonActive
            : styles.tabButtonInactive
        }`}
      >
        <Image size={24} className={styles.icon} />
        <span className={styles.label}>Image</span>
      </button>

      <button
        onClick={() => onChangeTab("scan")}
        className={`${styles.tabButton} ${
          activeTab === "scan"
            ? styles.tabButtonActive
            : styles.tabButtonInactive
        }`}
      >
        <QrCode size={24} className={styles.icon} />
        <span className={styles.label}>Scan</span>
      </button>

      <button
        onClick={() => onChangeTab("list")}
        className={`${styles.tabButton} ${
          activeTab === "list"
            ? styles.tabButtonActive
            : styles.tabButtonInactive
        }`}
      >
        <List size={24} className={styles.icon} />
        <span className={styles.label}>List</span>
      </button>
    </div>
  );
};

export default TabBar;
