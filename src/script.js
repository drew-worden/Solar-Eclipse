import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "/node_modules/three/examples/jsm/controls/OrbitControls.js"
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js"

//global declaration
let scene
let camera
let renderer
const canvas = document.getElementsByTagName("canvas")[0]
scene = new THREE.Scene()
const fov = 60
const aspect = window.innerWidth / window.innerHeight
const near = 0.1
const far = 1000

//camera
camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.z = 4
camera.position.x = 8
scene.add(camera)

//default renderer
renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true
})
renderer.autoClear = false
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1)
renderer.setClearColor(0x000000, 0.0)

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
const controls = new OrbitControls(camera, renderer.domElement)

//bloom renderer
const renderScene = new RenderPass(scene, camera)
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
bloomPass.threshold = 0
bloomPass.strength = 4 //intensity of glow
bloomPass.radius = 1
const bloomComposer = new EffectComposer(renderer)
bloomComposer.setSize(window.innerWidth, window.innerHeight)
bloomComposer.renderToScreen = true
bloomComposer.addPass(renderScene)
bloomComposer.addPass(bloomPass)

//sun object
const color = new THREE.Color("#FDB813")
const geometry = new THREE.IcosahedronGeometry(1, 15)
const material = new THREE.MeshBasicMaterial({ color: color })
const sphere = new THREE.Mesh(geometry, material)
sphere.position.set(-50, 20, -60)
sphere.layers.set(1)
scene.add(sphere)

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64)

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
	map: THREE.ImageUtils.loadTexture("texture/galaxy1.png"),
	side: THREE.BackSide,
	transparent: true
})

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial)
starMesh.layers.set(1)
scene.add(starMesh)

//earth geometry
const earthgeometry = new THREE.SphereGeometry(1, 32, 32)

//earth material
const earthMaterial = new THREE.MeshPhongMaterial({
	roughness: 1,
	metalness: 0,
	map: THREE.ImageUtils.loadTexture("texture/earthmap1.jpg"),
	bumpMap: THREE.ImageUtils.loadTexture("texture/bump.jpg"),
	bumpScale: 0.3
})

//earthMesh
const earthMesh = new THREE.Mesh(earthgeometry, earthMaterial)
earthMesh.receiveShadow = true
earthMesh.castShadow = true
earthMesh.layers.set(0)
scene.add(earthMesh)

//cloud geometry
const cloudgeometry = new THREE.SphereGeometry(1.02, 32, 32)

//cloud material
const cloudMaterial = new THREE.MeshPhongMaterial({
	map: THREE.ImageUtils.loadTexture("texture/earthCloud.png"),
	transparent: true
})

//cloudMesh
const cloud = new THREE.Mesh(cloudgeometry, cloudMaterial)
earthMesh.layers.set(0)
scene.add(cloud)

//moon geometry
const moongeometry = new THREE.SphereGeometry(0.27, 32, 32)

//moon material
const moonMaterial = new THREE.MeshPhongMaterial({
	roughness: 5,
	metalness: 0,
	map: THREE.ImageUtils.loadTexture("texture/moonmap4k.jpg"),
	bumpMap: THREE.ImageUtils.loadTexture("texture/moonbump4k.jpg"),
	bumpScale: 0.02
})

//moonMesh
const moonMesh = new THREE.Mesh(moongeometry, moonMaterial)
moonMesh.receiveShadow = true
moonMesh.castShadow = true
moonMesh.position.x = 3
moonMesh.position.y = -0.4
moonMesh.layers.set(0)
scene.add(moonMesh)

var moonPivot = new THREE.Object3D()
earthMesh.add(moonPivot)
moonPivot.add(moonMesh)

var cameraPivot = new THREE.Object3D()
earthMesh.add(cameraPivot)
cameraPivot.add(camera)

//ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2)

//directional light
var sunLight = new THREE.DirectionalLight(0xffffff, 1)
sunLight.decay = 1
sunLight.intensity = 2
sunLight.position.set(-50, 20, -60)
sunLight.castShadow = true
sunLight.shadow.mapSize.width = 1024 * 2
sunLight.shadow.mapSize.height = 1024 * 2
sunLight.shadow.camera.near = 0
sunLight.shadow.camera.far = 10
scene.add(sunLight)
sunLight.target = earthMesh

//point Light
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.castShadow = true
pointLight.shadowCameraVisible = true
pointLight.shadowBias = 0.00001
pointLight.shadowDarkness = 0.2
pointLight.shadowMapWidth = 2048
pointLight.shadowMapHeight = 2048
pointLight.position.set(-50, 20, -60)

//resize listner
window.addEventListener(
	"resize",
	() => {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize(window.innerWidth, window.innerHeight)
		bloomComposer.setSize(window.innerWidth, window.innerHeight)
	},
	false
)

//animation loop
const animate = () => {
	requestAnimationFrame(animate)
	cloud.rotation.y -= 0.0002
	moonPivot.rotation.y -= 0.005
	moonPivot.rotation.x = 0.5
	cameraPivot.rotation.y += 0.001
	starMesh.rotation.y += 0.0002
	camera.layers.set(1)
	bloomComposer.render()
	renderer.clearDepth()
	camera.layers.set(0)
	renderer.render(scene, camera)
}

animate()
