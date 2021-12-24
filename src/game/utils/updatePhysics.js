export function updatePhysics(world,overhangs) {
    world.step(1 / 60);
  
    // Copy coordinates from Cannon.js to Three.js
    overhangs.forEach((element) => {
      element.threejs.position.copy(element.cannonjs.position);
      element.threejs.quaternion.copy(element.cannonjs.quaternion);
    });
}