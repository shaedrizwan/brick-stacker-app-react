export function missedTheSpot(scene,world,stack,gameEnded,setScore,resultsRef) {
    const topLayer = stack[stack.length - 1];
  
    world.remove(topLayer.cannonjs);
    scene.remove(topLayer.threejs);
  
    gameEnded = true;
    setScore(0)
    resultsRef.current.style.display = "flex";
}