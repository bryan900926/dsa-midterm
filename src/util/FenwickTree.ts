export type TreeNodeInfo = {
  index: number;
  value: number;
  coverLeft: number;
  coverRight: number;
};

export type UpdateStep = {
  updatedIndex: number;
  affectedRange: [number, number];
  oldValue: number;
  newValue: number;
};

export type QueryStep = {
  currentIndex: number;
  lowbit: number;
  range: [number, number];
  bitValue: number;
  partialSum: number;
};

export class FenwickTree{
    private size: number;
    private tree: number[];
    private arr: number[];

    constructor(s: number){
        if (!Number.isInteger(s) || s < 1) {
            throw new Error("Invalid array size");
        }
        this.size = s;
        this.tree = new Array(this.size + 1).fill(0);
        this.arr = new Array(this.size + 1).fill(0);
    }

    private lowbit(i: number): number{
        return i & -i;
    }

    private checkInteger(...values: number[]): void {
        for (const val of values) {
            if (!Number.isFinite(val)) {
                throw new Error("Non-integer input is not allowed");
            }
        }
    }
    
    build(inputArr: number[]): void {
        if (inputArr.length !== this.size) {
            throw new Error("Array size outside the supported range");
        }

        this.tree.fill(0);
        this.arr.fill(0);

        for (let i = 0; i < inputArr.length; i++) {
            this.checkInteger(inputArr[i]);
            this.update(i+1, inputArr[i]);
        }
    }

    update(index: number, delta: number): void{
        this.checkInteger(index, delta);
        if(index < 1 || index > this.size){
            throw new Error("index out of range");
        }
        this.arr[index] += delta;
        let i=index;
        while(i <= this.size){
            this.tree[i] += delta;
            i += this.lowbit(i);
        }
    }

    getUpdateTrace(index: number, delta: number): UpdateStep[] {
        this.checkInteger(index, delta);
        if (index < 1 || index > this.size) {
            throw new Error("index out of range");
        }
        const steps: UpdateStep[] = [];
        let i = index;
        
        while (i <= this.size) {
            const oldVal = this.tree[i];
            const newVal = oldVal + delta;
            const range = this.getCoverRange(i);
        
            steps.push({
                updatedIndex: i,
                affectedRange: [range[0], range[1]],
                oldValue: oldVal,
                newValue: newVal
            });
        
            i += this.lowbit(i);
        }
        
        return steps;
    }

    getQueryTrace(index: number): QueryStep[] {
        this.checkInteger(index);
        if (index < 0 || index > this.size) {
            throw new Error("index out of range");
        }
        const steps: QueryStep[] = [];
        let sum = 0;
        let i = index;
            
        while (i > 0) {
            const bitVal = this.tree[i];
            sum += bitVal;
            const range = this.getCoverRange(i);
            
            steps.push({
                currentIndex: i,
                lowbit: this.lowbit(i),
                range: [range[0], range[1]],
                bitValue: bitVal,
                partialSum: sum
            });
            
            i -= this.lowbit(i);
            }
            return steps;
        }

    query(index: number): number{
        this.checkInteger(index);
        if(index < 0 || index > this.size){
            throw new Error("index out of range");
        }
        let sum = 0;
        let i=index;
        while(i > 0){
            sum += this.tree[i];
            i -= this.lowbit(i);
        }
        return sum;
    }

    rangeQuery(left: number, right: number): number{
        this.checkInteger(left, right);
        if(left > right || left < 1 || right > this.size){
            throw new Error("index out of range");
        }
        return this.query(right)-this.query(left-1);
    }

    getTreeArray(): number[]{
        return [...this.tree];
    }

    getArray(): number[]{
        return this.arr.slice(1);
    }

    getUpdatePath(index: number): number[]{
        this.checkInteger(index);
        if(index < 1 || index > this.size){
            console.log(this.size);
            console.log(index);
            throw new Error("index out of range");
        }
        let path: number[] = [];
        let i=index;
        while(i <= this.size){
            path.push(i); 
            i += this.lowbit(i);
        }
        return path;
    }

    getQueryPath(index: number): number[]{
        this.checkInteger(index);
        if(index < 0 || index > this.size){
            throw new Error("index out of range");
        }
        let path: number[] = [];
        let i=index
        while(i > 0){
            path.push(i); 
            i -= this.lowbit(i);
        }
        return path;
    }

    getCoverRange(index: number): [number, number]{
        this.checkInteger(index);
        if(index <= 0 || index > this.size){
            throw new Error("index out of range");
        }
        return [index - this.lowbit(index) + 1, index];
    }

    getTreeInfo(): TreeNodeInfo[] {
        const info: TreeNodeInfo[] = [];
        for(let index = 1 ; index <= this.size ; index++){
            const range = this.getCoverRange(index);

            info.push({
                index: index,
                value: this.tree[index],
                coverLeft: range[0],
                coverRight: range[1]
            });
        }
        return info;
    }

    updateWithTrace(index: number, delta: number): UpdateStep[]{
        const trace = this.getUpdateTrace(index, delta);
        this.update(index, delta);
        return trace;
    }
}

