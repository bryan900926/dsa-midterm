export type TreeNodeInfo = {
  index: number;
  value: number;
  coverLeft: number;
  coverRight: number;
};

export type UpdateResult = {
    type: "update";
    index : number;
    value : number;
    path : number[];
    treeArray : number[];
    array : number[];
}

export class FenwickTree{
    private size: number;
    private tree: number[];

    constructor(s: number){
        this.size = s;
        this.tree = new Array(this.size + 1).fill(0);
    }

    private lowbit(i: number): number{
        return i & -i;
    }
    
    add(index: number, value: number): void{
        if(index < 1 || index > this.size){
            throw new Error("index out of range");
        }
        while(index <= this.size){
            this.tree[index] += value;
            index += this.lowbit(index);
        }
    }

    prefixSum(index: number): number{
        if(index < 0 || index > this.size){
            throw new Error("index out of range");
        }
        let sum = 0;
        while(index > 0){
            sum += this.tree[index];
            index -= this.lowbit(index);
        }
        return sum;
    }

    rangeSum(left: number, right: number): number{
        if(left > right || left < 1 || right > this.size){
            throw new Error("index out of range");
        }
        return this.prefixSum(right)-this.prefixSum(left-1);
    }

    getTreeArray(): number[]{
        return [...this.tree];
    }

    getArray(): number[]{
        let value: number[] = new Array(this.size + 1).fill(0);
        let index: number = 1;
        while(index <= this.size){
            value[index] = this.prefixSum(index) - this.prefixSum(index - 1);
            index ++;
        }
        return value;
    }

    getUpdatePath(index: number): number[]{
        if(index < 1 || index > this.size){
            throw new Error("index out of range");
        }
        let path: number[] = [];
        while(index <= this.size){
            path.push(index); 
            index += this.lowbit(index);
        }
        return path;
    }

    getQueryPath(index: number): number[]{
        if(index < 0 || index > this.size){
            throw new Error("index out of range");
        }
        let path: number[] = [];
        while(index > 0){
            path.push(index); 
            index -= this.lowbit(index);
        }
        return path;
    }

    getCoverRange(index: number): number[]{
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

}

