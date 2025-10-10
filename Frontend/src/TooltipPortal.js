import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export default function TooltipPortal({ visible, x, y, children }) {
  const tooltipRef = useRef(null);

  // Ajusta la posición para que no se salga de la ventana
  useEffect(() => {
    if (!visible || !tooltipRef.current) return;
    const tip = tooltipRef.current;
    const rect = tip.getBoundingClientRect();
    let newX = x, newY = y;
    if (rect.right > window.innerWidth) {
      newX = window.innerWidth - rect.width - 8;
    }
    if (rect.bottom > window.innerHeight) {
      newY = window.innerHeight - rect.height - 8;
    }
    tip.style.left = `${Math.max(0, newX)}px`;
    tip.style.top = `${Math.max(0, newY)}px`;
  }, [x, y, visible]);

  if (!visible) return null;

  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      className="custom-tooltip"
      style={{
        display: "block",
        opacity: 1,
        position: "fixed",
        left: x,
        top: y,
        zIndex: 99999,
        pointerEvents: "none",
        background: "#131313",
        color: "#fff",
        border: "1.5px solid #9b0018",
        borderRadius: 7,
        fontSize: "0.93em",
        padding: "7px 13px 7px 13px",
        fontFamily: "inherit",
        boxShadow: "0 2px 12px #000a",
        whiteSpace: "nowrap",
        transition: "opacity 0.18s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none"
      }}
    >
      {children}
    </div>,
    document.body
  );
}