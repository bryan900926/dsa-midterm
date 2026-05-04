import React from 'react';
import './FenwickNode.css';
import { motion } from 'framer-motion';

export interface FenwickNodeProps {
  x: number;
  y: number;
  index: number; // Optional index for reference, not used in rendering
  value: number;
  radius: number;
  range: [number, number];
  isActive: boolean; // We pass a simple boolean now instead of a status string
}

const FenwickNode: React.FC<FenwickNodeProps> = ({
  x,
  y,
  value,
  range,
  isActive,
  radius = 20,
}) => {
  return (
    // 1. Animate the Group: It sits at (x, y), but floats up 15px when active
    <motion.g 
      animate={{ 
        x: x, 
        y: isActive ? y - 15 : y 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* 2. Animate the Circle: Changes color and grows when active */}
      <motion.circle 
        r={radius} 
        animate={{
          fill: isActive ? '#fef08a' : '#1e293b',    // Yellow or Dark Blue
          stroke: isActive ? '#eab308' : '#475569',  // Dark Yellow or Slate
          scale: isActive ? 1.15 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        strokeWidth={2} 
      />
      {/* The Core Value (Changes to dark text when background is yellow) */}
      <motion.text 
        textAnchor="middle" 
        dominantBaseline="central"
        animate={{ fill: isActive ? '#1e293b' : '#f8fafc' }}
        fontSize="16" 
        fontFamily="monospace"
        fontWeight="bold"
      >
        {value}
      </motion.text>
      
      {/* The Range (Bottom Center) */}
      <text y={40} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">
        [{range[0]}, {range[1]}]
      </text>
      
    </motion.g>
  );
};

export default FenwickNode;