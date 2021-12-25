import { generateBox } from "./generateBox";

export function addLayer({x, z, width, depth, direction,scene,world,stack,boxHeight}) {
    const y = boxHeight * stack.length;
    const layer = generateBox(x, y, z, width, depth, false,scene,world,stack);
    layer.direction = direction;
    stack.push(layer);
}