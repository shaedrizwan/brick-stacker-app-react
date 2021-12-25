import './initGame.css';
import * as THREE from 'three';
import CANNON from 'cannon';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import {updatePhysics} from './utils/updatePhysics';
import {cutBox} from './utils/cutBox';
import {addOverhang} from './utils/addOverhang';
import {addLayer} from './utils/addLayer';
import {missedTheSpot} from './utils/missedTheSpot';


let camera, scene, renderer;
let world;
let stack;
let overhangs;
const boxHeight = 1;
const originalBoxSize = 3;
let gameStarted;
let gameEnded;

export function InitGame() {

    const canvasRef = useRef()
    const instructionsRef = useRef()
    const resultsRef = useRef()

    const [score,setScore] = useState(0)
    const [finalScore,setFinalScore] = useState(0)

    useEffect(()=>{
        gameStarted = false;
        gameEnded = true;
        stack = [];
        overhangs = [];
        
        const aspect = window.innerWidth / window.innerHeight;

        
        
        // Initialize ThreeJS Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x87ceeb );

        // Initialize CannonJS
        world = new CANNON.World();
        world.gravity.set(0, -10, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 40;

        
        // Initial Camera
        camera = new THREE.PerspectiveCamera(85,aspect,1,200);
        camera.position.set(4, 4, 4);
        camera.lookAt(0, 0, 0);


        //Inital Steady Bricks
        addLayer({x:0, y:0, width:originalBoxSize, depth:originalBoxSize,scene,world,stack,boxHeight});
        addLayer({x:-2, y:0, width:originalBoxSize, depth:originalBoxSize,scene,world,stack,boxHeight});
        addLayer({x:-2, y:-2, width:originalBoxSize, depth:originalBoxSize,scene,world,stack,boxHeight});

        // Set up lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(10, 20, 0);
        scene.add(dirLight);

        // Set up renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(animation);
        canvasRef.current.appendChild(renderer.domElement);

        window.addEventListener("mousedown", eventHandler);
        window.addEventListener("touchstart", eventHandler);
        window.addEventListener("keydown", function (event) {
        if (event.key === " ") {
            event.preventDefault();
            if(gameEnded){
            startGame()
            }else{
            eventHandler();
            }
            return;
        }
        if (event.key === "R" || event.key === "r") {
            event.preventDefault();
            startGame();
            return;
        }
        });

        function eventHandler() {
            if (!gameStarted) startGame();
            else splitBlockAndAddNextOneIfOverlaps();
        }

        function startGame() {
            gameStarted = true;
            gameEnded = false;
            stack = [];
            overhangs = [];
          
            instructionsRef.current.style.display = "none";
            resultsRef.current.style.display = "none";
            
            // Remove every object from world
            if (world) {
              while (world.bodies.length > 0) {
                world.remove(world.bodies[0]);
              }
            }
          
            // Remove every Bricks from the Scene
            if (scene) {
              while (scene.children.find((c) => c.type === "Mesh")) {
                const mesh = scene.children.find((c) => c.type === "Mesh");
                scene.remove(mesh);
              }

              // Foundation Brick
              addLayer({x:0, z:0, width:originalBoxSize, depth:originalBoxSize,scene,world,stack,boxHeight});
          
              // First Brick
              addLayer({x:-10, z:0, width:originalBoxSize, depth:originalBoxSize,direction:"x",scene,world,stack,boxHeight});
            }
          
            // Ground Plane
            const groundGeometry = new THREE.BoxGeometry(100, 0.1, 100);
            const groundMaterial = new THREE.MeshStandardMaterial({ color:0xc68767 });
            const mesh = new THREE.Mesh(groundGeometry, groundMaterial);
            mesh.position.set(-2, -0.5, -2);
            scene.add(mesh);
          
            const shape = new CANNON.Box(
              new CANNON.Vec3(100/2,0.1/2,100/2)
            );
            let mass = 0;
            const body = new CANNON.Body({ mass, shape });
            body.position.set(-2,-0.5,-2);
            world.addBody(body);
          
            // Reset camera positions
            if (camera) {
              camera.position.set(4, 4, 4);
              camera.lookAt(0, 0, 0);
            }
        }
        

        function splitBlockAndAddNextOneIfOverlaps() {
            if (gameEnded) return;
          
            const topLayer = stack[stack.length - 1];
            const previousLayer = stack[stack.length - 2];
          
            const direction = topLayer.direction;
          
            const size = direction === "x" ? topLayer.width : topLayer.depth;
            const delta =
              topLayer.threejs.position[direction] -
              previousLayer.threejs.position[direction];
            const overhangSize = Math.abs(delta);
            const overlap = size - overhangSize;
          
            if (overlap > 0) {
              cutBox(topLayer, overlap, size, delta);
          
              // Overhang
              const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
              const overhangX =
                direction === "x"
                  ? topLayer.threejs.position.x + overhangShift
                  : topLayer.threejs.position.x;
              const overhangZ =
                direction === "z"
                  ? topLayer.threejs.position.z + overhangShift
                  : topLayer.threejs.position.z;
              const overhangWidth = direction === "x" ? overhangSize : topLayer.width;
              const overhangDepth = direction === "z" ? overhangSize : topLayer.depth;
          
              addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth,stack,overhangs,scene,world);
          
              // Next Brick attributes
              const nextX = direction === "x" ? topLayer.threejs.position.x : -10;
              const nextZ = direction === "z" ? topLayer.threejs.position.z : -10;
              const newWidth = topLayer.width;
              const newDepth = topLayer.depth;
              const nextDirection = direction === "x" ? "z" : "x";
              setScore(score => score + 1)
              addLayer({x:nextX, z:nextZ, width:newWidth, depth:newDepth, direction:nextDirection,scene,world,stack,boxHeight});
            } else {
                setFinalScore(stack.length - 2)
                missedTheSpot(scene,world,stack,gameEnded,setScore,resultsRef);
            }
          }


        function animation() {
            const speed = 0.15;
        
            const topLayer = stack[stack.length - 1];
        
            // Brick movement
            if (!gameEnded) {
              topLayer.threejs.position[topLayer.direction] += speed;
              topLayer.cannonjs.position[topLayer.direction] += speed;
        
              if (topLayer.threejs.position[topLayer.direction] > 10) {
                missedTheSpot(scene,world,stack,gameEnded,setScore,resultsRef);
              }
            } 
        
            // Increase camera height
            if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
              camera.position.y += speed;
            }
        
            updatePhysics(world,overhangs);
            renderer.render(scene, camera);
        }

        return () => canvasRef.current.removeChild( renderer.domElement);
    },[])



  return(
    <div ref={canvasRef} id="root">
        <div ref={instructionsRef} id="instructions">
            <div className="content">
                <p>Stack the blocks on top of each other</p>
                <p>Click, tap or press Space when a block is above the stack. Can you reach the blue color blocks?</p>
                <p>Click, tap or press Space to start game</p>
            </div>
        </div>

        <div ref={resultsRef} id="results">
        <div className="content">
            <p>You missed the block</p>
            <div>Your score is <span id="final-score">{finalScore}</span></div>
            <p>To reset the game press R</p>
        </div>
        </div>

        <div id="score">{score}</div>
    </div>
  )
}
