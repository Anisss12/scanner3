"use client";

import React, { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./Scanner.module.css";

const Scanner = ({ onScanned }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [detector, setDetector] = useState(null);
  const [noBarcodeDetected, setNoBarcodeDetected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // Countdown timer (in seconds)
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const initBarcodeDetector = async () => {
      if ("BarcodeDetector" in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({
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
          });
          setDetector(barcodeDetector);
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
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if (scanning && detector) {
      startScanner();
      setTimeLeft(10); // Reset timer
      startCountdown();

      // Stop scanning if no barcode is detected after 10 seconds
      timerRef.current = setTimeout(() => {
        setNoBarcodeDetected(true);
        stopScanner();
      }, 10000);
    }
  }, [scanning, detector]);

  const startScanner = async () => {
    if (!videoRef.current || !detector) return;

    try {
      setNoBarcodeDetected(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      videoRef.current.onplaying = () => {
        requestAnimationFrame(scanBarcode);
      };
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("An error occurred while accessing the camera.");
      setScanning(false);
    }
  };

  const scanBarcode = async () => {
    if (!scanning || !detector || !videoRef.current) return;

    try {
      if (videoRef.current.readyState < videoRef.current.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanBarcode);
        return;
      }

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

  const startCountdown = () => {
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

    setScanning(true);
    setNoBarcodeDetected(false);
    setTimeLeft(10); // Reset countdown
  };

  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <div className={`${styles.scannerCorner} ${styles.topLeft}`}></div>
        <div className={`${styles.scannerCorner} ${styles.topRight}`}></div>
        <div className={`${styles.scannerCorner} ${styles.bottomLeft}`}></div>
        <div className={`${styles.scannerCorner} ${styles.bottomRight}`}></div>

        <div className={styles.scanLine}></div>

        <video ref={videoRef} className={styles.video} playsInline muted />
      </div>

      {!scanning && noBarcodeDetected && (
        <p className={styles.noBarcodeMessage}>
          No barcode detected. Please try again.
        </p>
      )}

      {!scanning && (
        <button className={styles.restartButton} onClick={handleRestart}>
          Restart Scanning
        </button>
      )}
      {scanning && (
        <p className={styles.timerDisplay}>Time left: {timeLeft}s</p>
      )}
    </div>
  );
};

export default Scanner;
