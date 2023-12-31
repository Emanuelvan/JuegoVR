import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
THREE.ColorManagement.enabled = true;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

let controls, fondo;
const objetos = [];

//Camara
camera.position.set(200, 500, 200);
//hdr

fondo = new RGBELoader()
THREE.ColorManagement.enabled = true;
fondo.load('Assets/HDR/fondo.hdr',
    function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.background = texture;
        scene.environment = texture;
    })


// controls
controls = new OrbitControls(camera, renderer.domElement);


//Cubo
const textura = new THREE.TextureLoader().load('Assets/Texturas/Cubo.png')
//const textura_normal = new THREE.TextureLoader().load('Assets/Texturascubo_normal.png')
const textura_roughness = new THREE.TextureLoader().load('Assets/Texturas/cubo_roughnees.png')
textura.colorSpace = THREE.SRGBColorSpace;
//textura_Cubo
const geoCubo = new THREE.BoxGeometry(50, 50, 50);
const material = new THREE.MeshStandardMaterial({ color: 0xcfbdd9, map: textura, roughnessMap: textura_roughness });
//GridPiso
const gridHelper = new THREE.GridHelper(1000, 20, 0x73ccf5, 0xc985ed);
scene.add(gridHelper);

// roll-over helpers
const indicadorGeo = new THREE.BoxGeometry(50, 50, 50);
const indicadorMaterial = new THREE.MeshBasicMaterial({ color: 0xd5ced9, opacity: 0.5, transparent: true });
const indicadorMesh = new THREE.Mesh(indicadorGeo, indicadorMaterial);
scene.add(indicadorMesh);

//Raycaster
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();

const geometry = new THREE.PlaneGeometry(1000, 1000);
geometry.rotateX(- Math.PI / 2);
const plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
scene.add(plane);

objetos.push(plane);
//movimiento camara

let isShiftDown = false;
//
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('pointerdown', onPointerDown);
document.addEventListener('keydown', onDocumentKeyDown);
document.addEventListener('keyup', onDocumentKeyUp);

renderer.xr.addEventListener('sessionstart', (e) => {

    controls.update();

    const baseReferenceSpace = renderer.xr.getReferenceSpace();
    
    const cambioPosicion = camera.position;


    const cambioRotacion = camera.quaternion;

    const transform = new XRRigidTransform( cambioPosicion, { x: cambioRotacion.x, y: cambioRotacion.y, z: cambioRotacion.z, w: cambioRotacion.w } ); 
    const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform );

    renderer.xr.setReferenceSpace( teleportSpaceOffset );
   


});
const test = camera.quaternion;
console.log(test)

function onPointerMove(event) {

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    //raycaster.setFromCamera(pointer, camera);
    raycaster.set(camera.position, new THREE.Vector3(1,0,0).applyEuler(camera.rotation));
    const intersects = raycaster.intersectObjects(objetos, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        indicadorMesh.position.copy(intersect.point).add(intersect.face.normal);
        indicadorMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    }
}

function onPointerDown(event) {

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    //raycaster.setFromCamera(pointer, camera);
    raycaster.set(camera.position, new THREE.Vector3(1,0,0).applyEuler(camera.rotation));
    const intersects = raycaster.intersectObjects(objetos, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        // delete cube
        if (isShiftDown) {
            if (intersect.object !== plane) {
                scene.remove(intersect.object);
                objetos.splice(objetos.indexOf(intersect.object), 1);
            }
        // create cube
        } else {
            const PonerCubo = new THREE.Mesh(geoCubo, material);
            PonerCubo.position.copy(intersect.point).add(intersect.face.normal);
            PonerCubo.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
            scene.add(PonerCubo);
            objetos.push(PonerCubo);
            console.log("Uwu")
        }
        animate();
    }

}

// const arrowHelper = new THREE.ArrowHelper( camera.rotation, camera.position, 200, 0xcfbdd9 );
const arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(1,0,0).applyEuler(camera.rotation), camera.position, 200, 0xff000);
// const arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 200, 0xff000 );

scene.add( arrowHelper );

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = true; break;
    }

}

function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 16: isShiftDown = false; break;
    }

    if(event.keyCode == 38){
        camera.position.y = camera.position.y + 5
    }
}

function animate() {
    renderer.setAnimationLoop(animate);
    controls.update()
    renderer.render(scene, camera);
     arrowHelper.setDirection(camera.rotation);
    // arrowHelper.position.copy(camera.position);


}



animate();
