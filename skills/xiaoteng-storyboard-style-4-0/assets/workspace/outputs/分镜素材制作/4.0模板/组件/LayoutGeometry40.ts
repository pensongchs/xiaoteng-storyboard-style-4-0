type Rect40={left:number;right:number;top:number;bottom:number};
/** 忽略两像素内的边缘取整误差，检查实际相交面积。 */
export const overlaps40=(a:Rect40,b:Rect40,tolerance=2)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>tolerance&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>tolerance;
