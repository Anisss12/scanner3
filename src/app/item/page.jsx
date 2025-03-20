"use client";

import React, { useEffect, useState } from "react";
import styles from "./item.module.css";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  PaintBucket,
  Ruler,
  Frame,
  ALargeSmall,
  X,
} from "lucide-react";

const Page = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [designFilter, setDesignFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/saveData", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result.data);
        setFilteredData(result.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter((item) => {
        const matchesName = !nameFilter || item.name === nameFilter;
        const matchesDesign = !designFilter || item.design === designFilter;
        const matchesSize = !sizeFilter || item.sizes.includes(sizeFilter);
        const matchesColor = !colorFilter || item.colors.includes(colorFilter);
        const matchesSearch =
          !searchQuery ||
          [item.name, item.design, ...item.sizes, ...item.colors].some((val) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
          );

        return (
          matchesName &&
          matchesDesign &&
          matchesSize &&
          matchesColor &&
          matchesSearch
        );
      })
    );
  }, [nameFilter, designFilter, sizeFilter, colorFilter, searchQuery, data]);

  const uniqueNames = [...new Set(data.map((item) => item.name))];
  const uniqueDesigns = [...new Set(data.map((item) => item.design))];
  const uniqueSizes = [...new Set(data.flatMap((item) => item.sizes))];
  const uniqueColors = [...new Set(data.flatMap((item) => item.colors))];

  const clearFilters = () => {
    setNameFilter("");
    setDesignFilter("");
    setSizeFilter("");
    setColorFilter("");
    setSearchQuery("");
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(itemId)
        ? newSelection.delete(itemId)
        : newSelection.add(itemId);
      return newSelection;
    });
  };

  const handleDeleteSelected = async () => {
    if (!selectedItems.size)
      return console.error("No items selected for deletion.");

    try {
      const response = await fetch("/api/saveData", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      });

      if (!response.ok) throw new Error("Failed to delete items");

      setData((prev) => prev.filter((item) => !selectedItems.has(item._id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.filterSection}
        style={{ display: showFilter ? "flex" : "none" }}
      >
        <h2 className={styles.filterInfo}>
          FILTER THE ITEMS
          <X
            onClick={() => setShowFilter(!showFilter)}
            size={28}
            strokeWidth={0.75}
          />
        </h2>
        {[
          {
            label: "NAME",
            icon: ALargeSmall,
            options: uniqueNames,
            value: nameFilter,
            setValue: setNameFilter,
          },
          {
            label: "DESIGN",
            icon: Frame,
            options: uniqueDesigns,
            value: designFilter,
            setValue: setDesignFilter,
          },
          {
            label: "SIZE",
            icon: Ruler,
            options: uniqueSizes,
            value: sizeFilter,
            setValue: setSizeFilter,
          },
          {
            label: "COLOR",
            icon: PaintBucket,
            options: uniqueColors,
            value: colorFilter,
            setValue: setColorFilter,
          },
        ].map(({ label, icon: Icon, options, value, setValue }, index) => (
          <div key={index} className={styles.filterSelection}>
            <Icon size={28} strokeWidth={0.75} />
            <h2>{label}</h2>
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Filter by {label}</option>
              {options.map((option) => (
                <option key={`${label}-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <ul className={styles.header}>
        <div className={styles.nav}>
          <Link href={"/"}>{"<Go back"}</Link>
          <h2>List Products</h2>
        </div>
        <div className={styles.tools}>
          <div className={styles.searchSection}>
            <div className={styles.inputField}>
              <Search size={28} strokeWidth={0.75} />
              <input
                type="text"
                placeholder="Search by name, design, size, or color"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div
              className={styles.filterButton}
              onClick={() => setShowFilter(!showFilter)}
            >
              <SlidersHorizontal size={28} strokeWidth={0.75} />
              <h2>Filter</h2>
            </div>
          </div>
          <div className={styles.btns}>
            <button onClick={clearFilters} className={styles.clearButton}>
              Clear Filters
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedItems.size === 0}
              className={styles.deleteButton}
            >
              Delete Selected
            </button>
          </div>
        </div>

        <div className={styles.titleHeader}>
          <h2>BARCODE</h2>
          <h2>NAME</h2>
          <h2>DESIGN</h2>
          <h2>SIZES</h2>
          <h2>COLORS</h2>
          <h2>PRICE</h2>
        </div>
      </ul>

      <div className={styles.itemBox}>
        {filteredData.map((item) => (
          <div key={item._id} className={styles.item}>
            <input
              type="checkbox"
              checked={selectedItems.has(item._id)}
              onChange={() => handleSelectItem(item._id)}
            />
            <div className={styles.name}>{item.barcode}</div>
            <div>{item.name}</div>
            <div>{item.design}</div>
            <div>
              {item.sizes.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
            <div>
              {item.colors.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
            <div>{item.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
