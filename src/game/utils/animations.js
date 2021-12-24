import {updatePhysics} from './updatePhysics'

export function animation() {
    const speed = 0.15;

    const topLayer = stack[stack.length - 1];

    // Brick movement
    if (!gameEnded) {
      topLayer.threejs.position[topLayer.direction] += speed;
      topLayer.cannonjs.position[topLayer.direction] += speed;

      if (topLayer.threejs.position[topLayer.direction] > 10) {
        missedTheSpot();
      }
    } 

    // Increase camera height
    if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
      camera.position.y += speed;
    }

    updatePhysics(world,overhangs);
    renderer.render(scene, camera);
}