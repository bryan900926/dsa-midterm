import React, { useState } from "react";

import FenwickNode, { type FenwickNodeProps } from '../FenwickNode/FenwickNode.tsx';

interface FenwickTreeProps {
    nodes: FenwickNodeProps[];
    size: number;
}

