import type { FenwickNodeProps } from '../components/FenwickNode/FenwickNode.tsx';
import { hierarchy, tree } from 'd3-hierarchy';

interface TreeNode {
  id: number;
  children: TreeNode[];
}

const countBits = (n: number): number => {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
};

export interface FenwickEdgeProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const generateTopDownTreeNodes = (
  arraySize: number,
): {
  nodes: FenwickNodeProps[],
  edges: FenwickEdgeProps[],
  svgWidth: number,
  svgHeight: number
} => {

  const adjList = new Map<number, number[]>();
  const levelMinDeltaX = new Map<number, number[]>();
  adjList.set(0, []); // Root node with id 0

  for (let i = 1; i <= arraySize; i++) {
    const lsb = i & (-i);
    const parent = i - lsb;
    adjList.set(i, []);
    adjList.get(parent)?.push(i);
  }

  const buildHierarchy = (id: number): TreeNode => {
    return {
      id: id,
      children: adjList.get(id)?.map(childId => buildHierarchy(childId)) || []
    };
  };

  const rootData = buildHierarchy(0);

  const NODE_WIDTH = 80;
  const FIXED_PADDING = 40;
  const X_FOOTPRINT = NODE_WIDTH + FIXED_PADDING;
  const Y_LEVEL_HEIGHT = 100;


  const d3TreeLayout = tree<TreeNode>()
    .nodeSize([X_FOOTPRINT, Y_LEVEL_HEIGHT])
    .separation(() => 1);

  const d3Root = hierarchy(rootData);
  const layout = d3TreeLayout(d3Root);
  const descendants = layout.descendants();

  // 1. Calculate raw D3 coordinate boundaries FIRST
  const minRawX = Math.min(...descendants.map(d => d.x));
  const maxRawX = Math.max(...descendants.map(d => d.x));
  const maxRawY = Math.max(...descendants.map(d => d.y));

  const padding = 100; // Extra space around the tree

  const xOffset = Math.abs(minRawX) + padding;
  const yOffset = padding;

  const reactNodes: FenwickNodeProps[] = descendants.map(d => {
    const i = d.data.id;
    const lsb = i === 0 ? 0 : i & (-i);
    const start = i === 0 ? 0 : i - lsb + 1;
    levelMinDeltaX.set(countBits(i), [...(levelMinDeltaX.get(countBits(i)) || []), d.x]);
    
    return {
      value: 0,
      range: [start, i],
      x: d.x + xOffset, // Pushes everything neatly into the positive viewing area
      y: d.y + yOffset,
      radius: 40,
      index: i,
      isActive: false,
    };
  });

  const reactEdges: FenwickEdgeProps[] = layout.links().map(link => {
    return {
      id: `${link.source.data.id}-${link.target.data.id}`, 
      x1: link.source.x + xOffset,
      y1: link.source.y + yOffset,
      x2: link.target.x + xOffset,
      y2: link.target.y + yOffset
    };
  });

  const requiredSvgWidth = (maxRawX - minRawX) + (padding * 2); 
  const requiredSvgHeight = maxRawY + (padding * 2); 

  return { nodes: reactNodes, edges: reactEdges, svgWidth: requiredSvgWidth, svgHeight: requiredSvgHeight };
};