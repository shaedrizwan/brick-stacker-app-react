import CANNON from "cannon";

export function cutBox(topLayer, overlap, size, delta,boxHeight=1) {
    const direction = topLayer.direction;
    const newWidth = direction === "x" ? overlap : topLayer.width;
    const newDepth = direction === "z" ? overlap : topLayer.depth;
  
    // Update width and Depth
    topLayer.width = newWidth;
    topLayer.depth = newDepth;
  
    // Update ThreeJS model
    topLayer.threejs.scale[direction] = overlap / size;
    topLayer.threejs.position[direction] -= delta / 2;
  
    // Update CannonJS model
    topLayer.cannonjs.position[direction] -= delta / 2;
  
    // Replace shape in Cannonjs to smaller one (can't update. Need to add new)
    const shape = new CANNON.Box(
      new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
    );
    topLayer.cannonjs.shapes = [];
    topLayer.cannonjs.addShape(shape);
}