import { generateBox } from "./generateBox";

export function addOverhang(x, z, width, depth,stack,overhangs,scene,world,boxHeight=1) {
    const y = boxHeight * (stack.length - 1); // Add the new box on the same layer
    const overhang = generateBox(x, y, z, width, depth, true,scene,world,stack);
    overhangs.push(overhang);
}
