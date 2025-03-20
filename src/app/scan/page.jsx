"use client";
import { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";

const TextScanner = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("Extracted text will appear here...");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      extractText(file);
    }
  };

  const extractText = (imageFile) => {
    setLoading(true);
    Tesseract.recognize(
      imageFile,
      "eng", // Language (you can add more)
      {
        logger: (m) => console.log(m), // Logs progress
      }
    )
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("OCR Error:", error);
        setText("Error extracting text.");
        setLoading(false);
      });
  };

  const startRealTimeScanner = async () => {
    setScanning(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    requestAnimationFrame(scanFrame);
  };

  const stopRealTimeScanner = () => {
    setScanning(false);
    if (videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const scanFrame = async () => {
    if (!scanning) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    Tesseract.recognize(imageData, "eng")
      .then(({ data: { text } }) => {
        setText(text);
      })
      .catch((error) => {
        console.error("OCR Error:", error);
      });

    requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    return () => {
      stopRealTimeScanner();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Text Scanner from Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: "10px" }}
      />
      {image && (
        <div style={{ marginBottom: "10px" }}>
          <img
            src={image}
            alt="Uploaded"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "5px" }}
          />
        </div>
      )}
      {loading ? (
        <p>Extracting text...</p>
      ) : (
        <div
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            background: "#f9f9f9",
            borderRadius: "5px",
            minHeight: "100px",
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        <button onClick={startRealTimeScanner} disabled={scanning}>
          Start Real-Time Scanner
        </button>
        <button onClick={stopRealTimeScanner} disabled={!scanning}>
          Stop Real-Time Scanner
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <video ref={videoRef} style={{ width: "100%", borderRadius: "5px" }} />
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width="640"
          height="480"
        />
      </div>
    </div>
  );
};

export default TextScanner;
