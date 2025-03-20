import React from "react";
import styles from "./confirm.module.css";

const Confirm = ({ handleConfirm, response, data }) => {
  return (
    <div
      className={styles.confirm}
      style={{ display: response ? "none" : "flex" }}
    >
      <h2>Are you sure to {data}</h2>
      <div className={styles.btns}>
        <button onClick={() => handleConfirm("cancel")}>CANCEL</button>
        <button onClick={() => handleConfirm("yes")}>YES</button>
      </div>
    </div>
  );
};

export default Confirm;
