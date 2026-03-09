let scene = new THREE.Scene()

let camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
)

camera.position.z = 2.5

let renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

/* Licht */

let light = new THREE.PointLight(0xffffff,1.2)
light.position.set(5,3,5)
scene.add(light)

/* Erde */

let loader = new THREE.TextureLoader()

let earthTexture = loader.load(
"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
)

let geometry = new THREE.SphereGeometry(1,128,128)

let material = new THREE.MeshStandardMaterial({map:earthTexture})

let earth = new THREE.Mesh(geometry,material)

scene.add(earth)

/* Marker */

let marker

function createMarker(){

const g = new THREE.SphereGeometry(0.03,16,16)
const m = new THREE.MeshBasicMaterial({color:0xff0000})

marker = new THREE.Mesh(g,m)

/* Marker als Kind der Erde */

earth.add(marker)

}

createMarker()

/* Raycaster */

let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

window.addEventListener("click",(event)=>{

mouse.x = (event.clientX/window.innerWidth)*2-1
mouse.y = -(event.clientY/window.innerHeight)*2+1

raycaster.setFromCamera(mouse,camera)

let intersects = raycaster.intersectObject(earth)

if(intersects.length>0){

let worldPoint = intersects[0].point.clone()

let localPoint = earth.worldToLocal(worldPoint)

marker.position.copy(localPoint.normalize().multiplyScalar(1.02))

let lat = Math.asin(localPoint.y)*(180/Math.PI)
let lon = Math.atan2(localPoint.z,localPoint.x)*(180/Math.PI)

loadWeather(lat,lon)

}

})

/* Wetter laden */

async function loadWeather(lat,lon){

let url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`

let response = await fetch(url)

let data = await response.json()

let temps = data.hourly.temperature_2m.slice(0,24)

document.getElementById("tempBox").innerText =
"Current Temperature: "+temps[0]+" °C"

updateGraph(temps)

}

/* Graph */

let ctx = document.getElementById("chart")

let chart = new Chart(ctx,{
type:"line",
data:{
labels:Array.from({length:24},(_,i)=>i),
datasets:[{
label:"Temperature °C",
data:[],
borderColor:"red"
}]
},
options:{responsive:true}
})

function updateGraph(temps){

chart.data.datasets[0].data = temps

chart.update()

}

/* Sterne */

function createStars(){

let starGeo = new THREE.BufferGeometry()

let starCount = 4000

let positions = []

for(let i=0;i<starCount;i++){

positions.push(
(Math.random()-0.5)*200,
(Math.random()-0.5)*200,
(Math.random()-0.5)*200
)

}

starGeo.setAttribute(
"position",
new THREE.Float32BufferAttribute(positions,3)
)

let starMat = new THREE.PointsMaterial({color:0xffffff})

let stars = new THREE.Points(starGeo,starMat)

scene.add(stars)

}

createStars()

/* Weltraum Animation */

let spaceScene = new THREE.Scene()

let spaceCamera = new THREE.PerspectiveCamera(
60,
320/200,
0.1,
1000
)

spaceCamera.position.z = 20

let spaceRenderer = new THREE.WebGLRenderer()

spaceRenderer.setSize(320,200)

document.getElementById("spaceBox").appendChild(spaceRenderer.domElement)

let sun = new THREE.Mesh(
new THREE.SphereGeometry(2,32,32),
new THREE.MeshBasicMaterial({color:0xffff00})
)

spaceScene.add(sun)

function createPlanet(distance,size,color){

let planet = new THREE.Mesh(
new THREE.SphereGeometry(size,16,16),
new THREE.MeshBasicMaterial({color})
)

planet.userData = {distance,angle:Math.random()*6}

spaceScene.add(planet)

return planet

}

let mercury = createPlanet(4,0.2,0xaaaaaa)
let venus = createPlanet(6,0.3,0xffcc88)
let earthP = createPlanet(8,0.35,0x3399ff)
let mars = createPlanet(10,0.25,0xff5533)

let planets=[mercury,venus,earthP,mars]

/* Animation */

function animate(){

requestAnimationFrame(animate)

earth.rotation.y += 0.001

planets.forEach(p=>{

p.userData.angle += 0.01

p.position.x = Math.cos(p.userData.angle)*p.userData.distance
p.position.z = Math.sin(p.userData.angle)*p.userData.distance

})

renderer.render(scene,camera)

spaceRenderer.render(spaceScene,spaceCamera)

}

animate()
