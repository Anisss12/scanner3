"use client";

import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import { Frown, ScanBarcode, Keyboard } from "lucide-react";
import styles from "./Scanner.module.css";

const Scanner = ({ onScanned }) => {
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const manualInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [detector, setDetector] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [noBarcodeDetected, setNoBarcodeDetected] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // Initialize Barcode Detector
  useEffect(() => {
    const initBarcodeDetector = async () => {
      if ("BarcodeDetector" in window) {
        try {
          setDetector(
            new window.BarcodeDetector({
              formats: [
                "qr_code",
                "code_128",
                "ean_13",
                "code_39",
                "code_93",
                "upc_a",
                "upc_e",
                "ean_8",
                "itf",
                "pdf417",
                "aztec",
                "data_matrix",
              ],
            })
          );
        } catch (error) {
          console.error("Barcode detector initialization error:", error);
          toast.error("Failed to initialize barcode detector");
        }
      } else {
        toast.error("Barcode Detector API not supported");
      }
    };

    initBarcodeDetector();

    return () => {
      // Clean up video tracks on unmount
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // When scanning starts and detector is ready, start the scanner and countdown
  useEffect(() => {
    if (scanning && detector) {
      startScanner();
      resetCountdown();
      timerRef.current = setTimeout(() => {
        setNoBarcodeDetected(true);
        stopScanner();
      }, 10000);
    }
  }, [scanning, detector]);

  // Automatically start scanning on mount
  useEffect(() => {
    setScanning(true);
    return () => setScanning(false);
  }, []);

  const startScanner = async () => {
    if (!videoRef.current || !detector) return;
    try {
      setNoBarcodeDetected(false);
      setTimeLeft(10);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      requestAnimationFrame(scanBarcode);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Error accessing the camera.");
      setScanning(false);
    }
  };

  const scanBarcode = async () => {
    if (!scanning || !detector || !videoRef.current) return;
    try {
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        const result = barcodes[0].rawValue;
        stopScanner();
        onScanned(result);
        return;
      }
      requestAnimationFrame(scanBarcode);
    } catch (error) {
      console.error("Scanning error:", error);
      requestAnimationFrame(scanBarcode);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const resetCountdown = () => {
    setTimeLeft(10);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRestart = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setNoBarcodeDetected(false);
    setTimeLeft(10);
    setScanning(true);
  };

  const handleManualSubmit = () => {
    if (manualCode.trim() !== "") {
      onScanned(manualCode.trim());
      setManualCode("");
    } else {
      toast.warning("Please enter a valid code.");
    }
  };

  return (
    <div className={styles.container}>
      {scanning && (
        <>
          <div className={styles.videoWrapper}>
            <div className={`${styles.scannerCorner} ${styles.topLeft}`}></div>
            <div className={`${styles.scannerCorner} ${styles.topRight}`}></div>
            <div
              className={`${styles.scannerCorner} ${styles.bottomLeft}`}
            ></div>
            <div
              className={`${styles.scannerCorner} ${styles.bottomRight}`}
            ></div>
            <div className={styles.scanLine}></div>
            <video ref={videoRef} className={styles.video} playsInline muted />
          </div>
          <h2 className={styles.timerDisplay}>{timeLeft}s</h2>
        </>
      )}
      {!scanning && noBarcodeDetected && (
        <div className={styles.noBarcodeMessage}>
          <Frown strokeWidth={1} size={200} />
          <h2>No barcode detected! Please try again.</h2>
        </div>
      )}
      {!scanning && (
        <button className={styles.restartButton} onClick={handleRestart}>
          Restart Scan <ScanBarcode strokeWidth={1.5} size={35} />
        </button>
      )}

      {/* Always visible manual input field */}
      <div className={styles.manualInputWrapper}>
        <input
          ref={manualInputRef}
          className={styles.inputBarcode}
          type="text"
          placeholder="Or enter code manually"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
        />
        <button className={styles.submitManualBtn} onClick={handleManualSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Scanner;
