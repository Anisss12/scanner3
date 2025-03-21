// components/LoadingScreen.js
"use client";
import React from "react";
import styles from "page.module.css"


const LoadingScreen = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <h2 className={styles.text}>Loading...</h2>
    </div>
  );
};

export default LoadingScreen;
