"use client";

import React, { useState, useEffect } from "react";
import { Copy, Plus, Scan } from "lucide-react";
import { toast } from "sonner";
import styles from "./ScanResult.module.css";

const ScanResult = ({ result, onScanAgain }) => {
  const [scanList, setScanList] = useState([]);
  const [pendingScans, setPendingScans] = useState([]);

  // Add each new scan to pendingScans if it's not already there
  useEffect(() => {
    if (
      result &&
      !pendingScans.includes(result) &&
      !scanList.includes(result)
    ) {
      setPendingScans((prev) => [...prev, result]);
    }
  }, [result, pendingScans, scanList]);

  // Add all pending scans to scanList in bulk
  const handleAddToList = () => {
    if (pendingScans.length > 0) {
      setScanList((prev) => [...prev, ...pendingScans]);
      toast.success(`${pendingScans.length} barcode(s) added to list`);
      setPendingScans([]);
    } else {
      toast.error("No new barcodes to add");
    }
  };

  // Copy latest barcode to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard
        .writeText(result)
        .then(() => toast.success("Copied to clipboard"))
        .catch(() => toast.error("Failed to copy to clipboard"));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Scan Result</h2>
      <div className={styles.resultBox}>
        <p className={styles.resultText}>{result || "No barcode scanned"}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.buttonGroup}>
          <button
            onClick={copyToClipboard}
            className={styles.buttonSecondary}
            disabled={!result}
          >
            <Copy size={18} />
            <span>Copy</span>
          </button>
          <button
            onClick={handleAddToList}
            className={styles.buttonSecondary}
            disabled={pendingScans.length === 0}
          >
            <Plus size={18} />
            <span>Add to List</span>
          </button>
        </div>
        <button onClick={onScanAgain} className={styles.buttonPrimary}>
          <Scan size={18} />
          <span>Scan Again</span>
        </button>
      </div>
      <div className={styles.entryResult}>
        <h3>Pending Barcodes</h3>
        <ul>
          {pendingScans.length > 0 ? (
            pendingScans.map((barcode, idx) => <li key={idx}>{barcode}</li>)
          ) : (
            <li>No pending barcodes</li>
          )}
        </ul>
        <h3>Scanned Barcodes</h3>
        <ul>
          {scanList.length > 0 ? (
            scanList.map((barcode, idx) => <li key={idx}>{barcode}</li>)
          ) : (
            <li>No barcodes added yet</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ScanResult;
