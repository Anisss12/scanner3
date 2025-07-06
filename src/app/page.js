"use client";
import React, { useState, useEffect, use } from "react";
import { toast, Toaster } from "sonner";
import Scanner from "./components/Scanner";
import ImageScanner from "./components/ImageScanner";
import ScannedList from "./components/ScannedList";
import CustomerForm from "./components/CustomerForm";
import TabBar from "./components/TabBar";
import HomeScreen from "./components/HomeScreen";
import ScanResult from "./components/ScanResult";
import styles from "./page.module.css";
import Confirm from "./components/Confirm/Confirm";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showForm, setShowForm] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [lastScannedResult, setLastScannedResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [response, setResponse] = useState(true);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    // Check if BarcodeDetector API is available
    if (!("BarcodeDetector" in window)) {
      console.warn("Barcode Detector API not supported");
    }

    // Load scanned items from localStorage
    const savedItems = localStorage.getItem("scannedItems");

    if (savedItems) {
      setScannedItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    // Save scanned items to localStorage
    localStorage.setItem("scannedItems", JSON.stringify(scannedItems));
  }, [scannedItems]);

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    setShowResult(false);
  };

  const handleScanned = (result) => {
    setLastScannedResult(result);
    setShowResult(true);
    // Only add if not already present
    setScannedItems((prev) =>
      prev.includes(result) ? prev : [...prev, result]
    );
  };

  const handleAddToList = (data) => {
    setScannedItems((prev) => [data, ...prev]);
    setActiveTab("list");
    setShowResult(false);
  };

  const handleScanAgain = () => {
    setShowResult(false);
    // The activeTab should already be either 'scan' or 'upload'
  };

  const handleClearItem = (index) => {
    setScannedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllItems = () => {
    setResponse(false);
  };

  useEffect(() => {
    if (confirm === true) {
      setScannedItems([]);
    }
  }, [response, confirm]);

  const renderContent = () => {
    if (showResult) {
      return (
        <ScanResult
          result={lastScannedResult || ""}
          scannedItems={scannedItems}
          onScanAgain={handleScanAgain}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return <HomeScreen onShowForm={() => setShowForm(true)} />;
      case "upload":
        return <ImageScanner onScanned={handleScanned} />;
      case "scan":
        return <Scanner onScanned={handleScanned} />;
      case "list":
        return (
          <ScannedList
            items={scannedItems}
            onClearItem={handleClearItem}
            onClearAll={handleClearAllItems}
          />
        );
      default:
        return null;
    }
  };

  const handleConfirm = (data) => {
    console.log(data);
    if (data === "cancel") {
      setConfirm(false);
      setResponse(true);
    }
    if (data === "yes") {
      setConfirm(true);
      setResponse(true);
    }
  };

  return (
    <div className={styles.container}>
      <Confirm
        handleConfirm={handleConfirm}
        response={response}
        data={"Delete"}
      ></Confirm>

      <Toaster position="bottom-center" />

      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to Bonadia </h1>
      </header>

      <main className={styles.main}>{renderContent()}</main>

      <TabBar activeTab={activeTab} onChangeTab={handleChangeTab} />

      {showForm && <CustomerForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Index;
