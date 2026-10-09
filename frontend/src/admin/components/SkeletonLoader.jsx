import React from "react";

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx}>
              <div
                className="placeholder-glow"
                style={{ width: cIdx === 0 ? "40px" : "80%" }}
              >
                <span
                  className="placeholder col-12 rounded"
                  style={{ height: "18px" }}
                ></span>
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="stat-card placeholder-glow">
      <div className="flex-grow-1">
        <span className="placeholder col-6 mb-2 rounded"></span>
        <span className="placeholder col-8 py-2 rounded"></span>
      </div>
      <div className="stat-icon-wrapper placeholder col-3 rounded-circle"></div>
    </div>
  );
};

export const ChartSkeleton = ({ height = 300 }) => {
  return (
    <div
      className="p-4 placeholder-glow d-flex flex-column justify-content-between"
      style={{ height }}
    >
      <div className="d-flex align-items-end justify-content-around h-75 gap-3 pt-3">
        <span
          className="placeholder rounded col-1"
          style={{ height: "45%" }}
        ></span>
        <span
          className="placeholder rounded col-1"
          style={{ height: "70%" }}
        ></span>
        <span
          className="placeholder rounded col-1"
          style={{ height: "35%" }}
        ></span>
        <span
          className="placeholder rounded col-1"
          style={{ height: "90%" }}
        ></span>
        <span
          className="placeholder rounded col-1"
          style={{ height: "60%" }}
        ></span>
        <span
          className="placeholder rounded col-1"
          style={{ height: "80%" }}
        ></span>
      </div>
      <div className="d-flex justify-content-around mt-3">
        <span className="placeholder col-1 rounded py-1"></span>
        <span className="placeholder col-1 rounded py-1"></span>
        <span className="placeholder col-1 rounded py-1"></span>
        <span className="placeholder col-1 rounded py-1"></span>
        <span className="placeholder col-1 rounded py-1"></span>
        <span className="placeholder col-1 rounded py-1"></span>
      </div>
    </div>
  );
};

export default TableSkeleton;
