"use client";

import React, { useRef } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import styles from "./ImageScanner.module.css";

const ImageScanner = ({ onScanned }) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;

      img.onload = async () => {
        try {
          if ("BarcodeDetector" in window) {
            const detector = new window.BarcodeDetector({
              formats: ["qr_code", "code_128", "ean_13"],
            });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              toast.error("Browser canvas not supported");
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const barcodes = await detector.detect(canvas);
            if (barcodes.length > 0) {
              onScanned(barcodes[0].rawValue);
              toast.success("Code detected!");
            } else {
              toast.error("No QR or barcode detected");
            }
          } else {
            toast.error("Barcode detection not supported");
          }
        } catch (error) {
          console.error("Image scanning error:", error);
          toast.error("Failed to scan image");
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };

      img.onerror = () => {
        toast.error("Failed to load image");
        URL.revokeObjectURL(imageUrl);
      };
    } else {
      toast.error("Please select an image file");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      <div onClick={handleUploadClick} className={styles.uploadBox}>
        <Upload size={48} className={styles.uploadIcon} />
        <h3 className={styles.uploadText}>Upload Image</h3>
        <p className={styles.uploadSubText}>
          Tap to select an image containing a QR code or barcode
        </p>
      </div>

      <button
        onClick={handleUploadClick}
        className={`btn-primary ${styles.browseButton}`}
      >
        <ImageIcon size={18} className={styles.browseButtonIcon} />
        <span>Browse Images</span>
      </button>
    </div>
  );
};

export default ImageScanner;
