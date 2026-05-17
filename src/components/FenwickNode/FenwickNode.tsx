import React from 'react';
import './FenwickNode.css';
import { motion } from 'framer-motion';

export interface FenwickNodeProps {
  x: number;
  y: number;
  index: number;
  value: number;
  radius: number;
  range: [number, number];
  isActive: boolean;
  highlightColor?: string; // Will be "#eab308", "#22c55e", "#ef4444", "#64748b", or "transparent"
}

const FenwickNode: React.FC<FenwickNodeProps> = ({
  x,
  y,
  value,
  range,
  isActive,
  highlightColor = "transparent",
  radius = 20,
}) => {
  
  const currentFill = highlightColor !== "transparent" ? highlightColor : '#1e293b';
  const textColor = highlightColor === "#eab308" ? '#1e293b' : '#f8fafc';

  const stringValue = String(value);
  const displayValue = stringValue.length > 4 
    ? stringValue.slice(0, 4) + ".." 
    : stringValue;

  return (
    <motion.g 
      animate={{ 
        x: x, 
        y: isActive ? y - 15 : y 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <title>{value}</title> 
      <motion.circle 
        r={radius} 
        animate={{
          fill: currentFill,    
          stroke: '#475569', 
          scale: isActive ? 1.15 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        strokeWidth={2} 
      />

      <motion.text 
        textAnchor="middle" 
        dominantBaseline="central"
        animate={{ fill: textColor }}
        fontSize="16" 
        fontFamily="monospace"
        fontWeight="bold"
      >
        {displayValue}
      </motion.text>

      <text y={40} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">
        [{range[0]}, {range[1]}]
      </text>

    </motion.g>
  );
};

export default FenwickNode;