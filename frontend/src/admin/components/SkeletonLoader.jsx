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
                <span className="placeholder col-12 rounded" style={{ height: "18px" }}></span>
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

export default TableSkeleton;
