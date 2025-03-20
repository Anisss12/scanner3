"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Copy,
  Save,
  FileText,
  File,
  Search,
  SlidersHorizontal,
  SquareUser,
  Barcode,
  PaintBucket,
  Ruler,
  Frame,
  X,
  Frown,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import styles from "./ScannedList.module.css";
import Confirm from "./Confirm/Confirm";

const ScannedList = ({ items, onClearItem, onClearAll }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterBarcode, setFilterBarcode] = useState("");
  const [filterDesign, setFilterDesign] = useState("");
  const [filterSizes, setFilterSizes] = useState("");
  const [filterColors, setFilterColors] = useState("");

  const [uniqueNames, setUniqueNames] = useState([]);
  const [uniqueBarcodes, setUniqueBarcodes] = useState([]);
  const [uniqueDesigns, setUniqueDesigns] = useState([]);
  const [uniqueSizes, setUniqueSizes] = useState([]);
  const [uniqueColors, setUniqueColors] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [response, setResponse] = useState(true);
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const names = [...new Set(items.map((item) => item.name))];
    const barcodes = [...new Set(items.map((item) => item.barcode))];
    const designs = [...new Set(items.map((item) => item.design))];
    const sizes = [...new Set(items.map((item) => item.sizes))];
    const colors = [...new Set(items.map((item) => item.colors))];

    setUniqueNames(names);
    setUniqueBarcodes(barcodes);
    setUniqueDesigns(designs);
    setUniqueSizes(sizes);
    setUniqueColors(colors);
  }, [items]);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const filteredItems = items.filter(
    (item) =>
      (filterName === "" || item.name === filterName) &&
      (filterBarcode === "" || item.barcode === filterBarcode) &&
      (filterDesign === "" || item.design === filterDesign) &&
      (filterSizes === "" || item.sizes === filterSizes) &&
      (filterColors === "" || item.colors === filterColors) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.design.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sizes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.colors.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = filteredItems.length;
  const totalUnit = filteredItems.reduce(
    (acc, item) => acc + Number(item.unit),
    0
  );
  const totalPrice = filteredItems.reduce((acc, item) => acc + item.total, 0);

  const handleSelectItem = (index) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(index)) {
      newSelectedItems.delete(index);
    } else {
      newSelectedItems.add(index);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleBulkDelete = () => {
    setResponse(false);
  };

  useEffect(() => {
    if (confirm === true) {
      const sortedIndices = Array.from(selectedItems).sort((a, b) => b - a);
      sortedIndices.forEach((index) => onClearItem(index));
      setSelectedItems(new Set());
      toast.success("Selected items deleted successfully");
    }
  }, [response, confirm]);

  const exportListAsText = () => {
    const exportItems = filteredItems;

    if (exportItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const content = exportItems.map((item) => JSON.stringify(item)).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `scanned-items-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("List exported successfully");
  };

  const exportListAsPDF = () => {
    const exportItems = filteredItems;

    if (exportItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Sales Report", 10, 10);

    const tableColumn = [
      "Name",
      "Mobile",
      "Barcode",
      "Design",
      "Sizes",
      "Colors",
      "Price",
      "Unit",
      "Total",
    ];
    const tableRows = [];

    exportItems.forEach((item) => {
      const itemData = [
        item.name,
        item.mobile,
        item.barcode,
        item.design,
        item.sizes,
        item.colors,
        item.price,
        item.unit,
        item.total,
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    autoTable(doc, {
      body: [
        ["", "", "", "", "", "", "Total Items", totalItems],
        ["", "", "", "", "", "", "Total Unit", totalUnit],
        ["", "", "", "", "", "", "Total Price", totalPrice],
      ],
      startY: doc.lastAutoTable.finalY + 10,
    });

    doc.save(`scanned-items-${new Date().toISOString().split("T")[0]}.pdf`);

    toast.success("List exported as PDF successfully");
  };

  const exportListAsXLSX = () => {
    const exportItems = filteredItems;

    if (exportItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const worksheetData = [
      [
        "Name",
        "Mobile",
        "Barcode",
        "Design",
        "Sizes",
        "Colors",
        "Price",
        "Unit",
        "Total",
      ],
      ...exportItems.map((item) => [
        item.name,
        item.mobile,
        item.barcode,
        item.design,
        item.sizes,
        item.colors,
        item.price,
        item.unit,
        item.total,
      ]),
      ["", "", "", "", "", "", "Total Items", totalItems],
      ["", "", "", "", "", "", "Total Unit", totalUnit],
      ["", "", "", "", "", "", "Total Price", totalPrice],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scanned Items");

    XLSX.writeFile(
      workbook,
      `scanned-items-${new Date().toISOString().split("T")[0]}.xlsx`
    );

    toast.success("List exported as XLSX successfully");
  };

  const handleConfirm = (data) => {
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
      <div className={styles.totals}>
        <p>
          <strong> Items:</strong> {totalItems}
        </p>
        <p>
          <strong>Unit:</strong> {totalUnit}
        </p>
        <p>
          <strong>Total Rs.:</strong> {totalPrice}
        </p>
      </div>
      <div className={styles.header}>
        <div className={styles.buttonGroup}>
          <button
            onClick={exportListAsText}
            className={`${styles.button} ${styles.buttonPrimary}`}
            aria-label="Export list as text"
          >
            <Save size={18} />
            TEXT
          </button>
          <button
            onClick={exportListAsPDF}
            className={`${styles.button} ${styles.buttonPrimary}`}
            aria-label="Export list as PDF"
          >
            <FileText size={18} />
            PDF
          </button>
          <button
            onClick={exportListAsXLSX}
            className={`${styles.button} ${styles.buttonPrimary}`}
            aria-label="Export list as XLSX"
          >
            <File size={18} />
            XLX
          </button>
          <button
            onClick={onClearAll}
            className={`${styles.button} ${styles.buttonSecondary}`}
            aria-label="Clear all items"
            disabled={items.length === 0}
          >
            <Trash2 size={18} />
            DELETE ALL
          </button>
          <button
            onClick={handleBulkDelete}
            className={`${styles.button} ${styles.buttonSecondary}`}
            aria-label="Delete selected items"
            disabled={selectedItems.size === 0}
          >
            <Trash2 size={18} />
            SELECT TO DELETE
          </button>
        </div>
        <div className={styles.searchFilterContainer}>
          <div className={styles.search}>
            <Search size={18} className={styles.searchIcon} />

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div
            onClick={() => setShowFilter(!showFilter)}
            className={styles.filterBtn}
          >
            <SlidersHorizontal size={25} strokeWidth={1} />
            <h2>FILTER</h2>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.card}>
          <Frown size={100} strokeWidth={1} />
          <p className={styles.cardText}>Empty</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {filteredItems.map((item, index) => (
            <li
              key={index}
              className={styles.listItem}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={styles.listItemButtonGroup}>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(item))}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  aria-label="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>

                <input
                  type="checkbox"
                  checked={selectedItems.has(index)}
                  onChange={() => handleSelectItem(index)}
                  className={styles.checkbox}
                />
              </div>

              <span className={styles.listItemText}>
                <div className={styles.nameMoile}>
                  <strong>Name:</strong> {item.name} <br />
                  <strong>Mobile:</strong> {item.mobile} <br />
                </div>
                <div className={styles.billInfo}>
                  <div className={styles.line}>
                    <strong>Barcode:</strong> {item.barcode}
                  </div>
                  <div className={styles.line}>
                    <strong>Design:</strong> {item.design}
                  </div>
                  <div className={styles.line}>
                    <strong>Sizes:</strong> {item.sizes}
                  </div>
                  <div className={styles.line}>
                    <strong>Colors:</strong> {item.colors}
                  </div>
                </div>
                <div className={styles.calculate}>
                  <strong>Price:</strong> {item.price}
                  <div className={styles.line2}>
                    <strong>Unit:</strong> {item.unit}
                  </div>
                  <div className={styles.line2}>
                    <strong>Total:</strong> {item.total}
                  </div>
                </div>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div
        style={{ display: showFilter ? "flex" : "none" }}
        className={styles.filterContainer}
      >
        <div className={styles.heading}>
          <h2>FILTER THE ITEMS</h2>
          <X
            onClick={() => setShowFilter(!showFilter)}
            size={25}
            strokeWidth={2}
          />
        </div>
        <div className={styles.option}>
          <h2>
            {" "}
            <SquareUser size={16} strokeWidth={1} /> CUSTOMER
          </h2>
          <select
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Select</option>
            {uniqueNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.option}>
          <h2>
            <Barcode size={16} strokeWidth={1} />
            BARCODE
          </h2>
          <select
            value={filterBarcode}
            onChange={(e) => setFilterBarcode(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Selet</option>
            {uniqueBarcodes.map((barcode) => (
              <option key={barcode} value={barcode}>
                {barcode}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.option}>
          <h2>
            {" "}
            <Frame size={16} strokeWidth={1} /> DESIGN
          </h2>
          <select
            value={filterDesign}
            onChange={(e) => setFilterDesign(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Select</option>
            {uniqueDesigns.map((design) => (
              <option key={design} value={design}>
                {design}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.option}>
          <h2>
            <Ruler size={16} strokeWidth={1} />
            SIZE
          </h2>
          <select
            value={filterSizes}
            onChange={(e) => setFilterSizes(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Select</option>
            {uniqueSizes.map((sizes) => (
              <option key={sizes} value={sizes}>
                {sizes}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.option}>
          <h2>
            <PaintBucket size={16} strokeWidth={1} /> COLOR
          </h2>
          <select
            value={filterColors}
            onChange={(e) => setFilterColors(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Select</option>
            {uniqueColors.map((colors) => (
              <option key={colors} value={colors}>
                {colors}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ScannedList;
