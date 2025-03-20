"use client";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import styles from "./CustomerForm.module.css";
import { ScanBarcode, FilePenLine, X, SquarePlus } from "lucide-react";
import { nanoid } from "nanoid";

const CustomerForm = ({ onClose }) => {
  const [barcode, setBarcode] = useState("");
  const [design, setDesign] = useState("");
  const [name, setName] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [price, setPrice] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const videoRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [detector, setDetector] = useState(null);
  const [showScanner, setShowScanner] = useState(false); // Set initial state to false

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
                "ean_13",
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
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (scanning && detector) {
      startScanner();
    }
  }, [scanning, detector]);

  const startScanner = async () => {
    if (!videoRef.current || !detector) return;

    try {
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
      if (error.name === "NotAllowedError") {
        toast.error(
          "Camera access denied. Please allow camera access in your browser settings."
        );
      } else if (error.name === "NotFoundError") {
        toast.error("No camera found on this device.");
      } else {
        toast.error("An error occurred while accessing the camera.");
      }
      setScanning(false);
    }
  };

  const scanBarcode = async () => {
    if (!scanning || !detector || !videoRef.current) return;

    try {
      const barcodes = await detector.detect(videoRef.current);

      if (barcodes.length > 0) {
        const result = barcodes[0].rawValue;
        setBarcode(result); // Set the barcode state with the scanned result
        stopScanner();
        setShowScanner(false); // Hide the scanner
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
  };

  const handleSizes = () => {
    if (sizeInput) {
      setSizes([...sizes, sizeInput]);
      setSizeInput("");
    }
  };

  const handleColors = () => {
    if (colorInput) {
      setColors([...colors, colorInput]);
      setColorInput("");
    }
  };

  const handleDeleteSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleDeleteColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (colors.length > 0 && sizes.length > 0) {
      const date = new Date();
      const id = nanoid();
      const dataToSubmit = {
        id,
        barcode,
        design,
        name,
        sizes,
        colors,
        price,
        date,
      };
      setSubmittedData(dataToSubmit);
      console.log(dataToSubmit);
      try {
        const response = await fetch(" /api/saveData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        });

        if (response.ok) {
          const result = await response.json();
          setSubmittedData(result);
          toast.error("Data saved successfully", result);
        } else {
          console.error("Failed to save data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      toast.error("Please fill all the inputs");
    }
  };

  const handleRescan = () => {
    setShowScanner(true);
    setScanning(true);
  };

  const handleTypeManually = () => {
    setShowScanner(false);
    stopScanner();
    barcodeInputRef.current.focus();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <h2
          style={{
            padding: "2vh",
            display: "flex",
            justifyContent: "space-between",
            flex: "row",
            width: "100%",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          PRODUCT DETAILS <X onClick={onClose} className={styles.closeBtn} />
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.barCode}>
            <h2>Barcode</h2>
            <input
              required
              ref={barcodeInputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className={styles.barCodeInput}
              type="text"
            />

            {showScanner ? (
              <div className={styles.container}>
                <div className={styles.videoWrapper}>
                  <video
                    ref={videoRef}
                    className={styles.video}
                    playsInline
                    muted
                  />
                </div>

                {/* Scanner corners */}
                <div
                  className={`${styles.scannerCorner} ${styles.topLeft}`}
                ></div>
                <div
                  className={`${styles.scannerCorner} ${styles.topRight}`}
                ></div>
                <div
                  className={`${styles.scannerCorner} ${styles.bottomLeft}`}
                ></div>
                <div
                  className={`${styles.scannerCorner} ${styles.bottomRight}`}
                ></div>

                {/* Scan line animation */}
                <div className={styles.scanLine}></div>

                <button type="button" onClick={handleTypeManually}>
                  Type Manually <FilePenLine />
                </button>
              </div>
            ) : (
              <button type="button" onClick={handleRescan}>
                TYPE / SCAN BARCODE{" "}
                <ScanBarcode
                  style={{
                    border: "1px solid var(--border-color)",
                    width: "30%",
                    height: "5vh",
                    padding: "0.3vh",
                    borderRadius: "1vh",
                  }}
                />
              </button>
            )}
          </div>

          <div className={styles.otherFiled}>
            <div className={styles.design}>
              <h2>Name</h2>
              <input
                required
                className={styles.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
              />
            </div>
            <div className={styles.design}>
              <h2>Design</h2>
              <input
                required
                className={styles.input}
                type="text"
                value={design}
                onChange={(e) => setDesign(e.target.value)}
                placeholder="Enter design"
              />
            </div>

            <div className={styles.sizes}>
              <h2>Sizes</h2>

              <div className={styles.field}>
                <input
                  className={styles.input}
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="Enter size"
                />
                <button type="button" onClick={handleSizes}>
                  <SquarePlus
                    style={{
                      background: "transparent",
                      height: "100%",
                      width: "4vh",
                    }}
                  />
                </button>
              </div>

              <ul>
                {sizes.map((size, index) => (
                  <li key={index}>
                    {size} <X onClick={() => handleDeleteSize(index)} />
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.colors}>
              <h2>Colors</h2>
              <div className={styles.field}>
                <input
                  className={styles.input}
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="Enter color"
                />
                <button type="button" onClick={handleColors}>
                  <SquarePlus
                    style={{
                      height: "100%",
                      width: "4vh",
                    }}
                  />
                </button>
              </div>
              <ul>
                {colors.map((color, index) => (
                  <li key={index}>
                    {color} <X onClick={() => handleDeleteColor(index)} />
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.price}>
              <h2>Price</h2>
              <input
                required
                className={styles.input}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>
            <div className={styles.submitBtn}>
              <button type="submit">SAVE</button>
            </div>
          </div>
        </form>

        {submittedData && (
          <div className={styles.result}>
            <h2>Submitted Data</h2>
            <p>
              <strong>Barcode:</strong> {submittedData.barcode}
            </p>
            <p>
              <strong>Design:</strong> {submittedData.design}
            </p>
            <p>
              <strong>Sizes:</strong> {submittedData.sizes?.join(", ") || ""}
            </p>
            <p>
              <strong>Colors:</strong> {submittedData.colors?.join(", ") || ""}
            </p>
            <p>
              <strong>Price:</strong> {submittedData.price}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(submittedData.date).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerForm;
