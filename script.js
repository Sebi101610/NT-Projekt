/* ===== GLOBUS ===== */

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
)

camera.position.z = 3

const renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

/* LICHT */

const light = new THREE.DirectionalLight(0xffffff,1)
light.position.set(5,3,5)
scene.add(light)

/* ERDE */

const texture = new THREE.TextureLoader().load(
"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
)

const earth = new THREE.Mesh(
new THREE.SphereGeometry(1,64,64),
new THREE.MeshPhongMaterial({map:texture})
)

scene.add(earth)

/* MARKER */

const marker = new THREE.Mesh(
new THREE.SphereGeometry(0.03,16,16),
new THREE.MeshBasicMaterial({color:0xff0000})
)

earth.add(marker)
marker.visible=false

/* ===== GRAPH ===== */

const canvas = document.getElementById("graph")
const ctx = canvas.getContext("2d")

canvas.width=300
canvas.height=150

let temps=[]

function drawGraph(){

ctx.clearRect(0,0,300,150)

ctx.strokeStyle="white"

ctx.beginPath()
ctx.moveTo(0,140)
ctx.lineTo(300,140)
ctx.stroke()

ctx.beginPath()

for(let i=0;i<temps.length;i++){

let x = i*10
let y = 140 - temps[i]*3

if(i===0) ctx.moveTo(x,y)
else ctx.lineTo(x,y)

}

ctx.strokeStyle="red"
ctx.stroke()

}

/* ===== PROTOKOLL ===== */

function logEvent(text){

let log = document.getElementById("log")

let time = new Date().toLocaleTimeString()

log.innerHTML += "["+time+"] "+text+"<br>"

log.scrollTop = log.scrollHeight

}

/* ===== WETTER ===== */

async function loadWeather(lat,lon){

let url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`

let res = await fetch(url)
let data = await res.json()

let temp = data.current.temperature_2m

document.getElementById("tempDisplay").innerText =
"Temperatur: "+temp+" °C"

temps.push(temp)

if(temps.length>30) temps.shift()

drawGraph()

}

/* ===== MARKER KLICK ===== */

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener("click",(event)=>{

mouse.x = (event.clientX/window.innerWidth)*2-1
mouse.y = -(event.clientY/window.innerHeight)*2+1

raycaster.setFromCamera(mouse,camera)

let hit = raycaster.intersectObject(earth)

if(hit.length>0){

let p = earth.worldToLocal(hit[0].point.clone())

marker.position.copy(
p.normalize().multiplyScalar(1.02)
)

marker.visible=true

let lat = Math.asin(p.y)*(180/Math.PI)
let lon = Math.atan2(p.z,p.x)*(180/Math.PI)

loadWeather(lat,lon)

}

})

/* ===== GLOBUS DREHEN ===== */

let dragging=false
let px=0
let py=0

window.addEventListener("mousedown",(e)=>{
dragging=true
px=e.clientX
py=e.clientY
})

window.addEventListener("mouseup",()=>dragging=false)

window.addEventListener("mousemove",(e)=>{

if(!dragging) return

earth.rotation.y += (e.clientX-px)*0.005
earth.rotation.x += (e.clientY-py)*0.005

px=e.clientX
py=e.clientY

})

/* ===== SONNENSYSTEM ===== */

const solarScene = new THREE.Scene()

const solarCamera = new THREE.PerspectiveCamera(60,1,0.1,1000)
solarCamera.position.z=10

const solarRenderer = new THREE.WebGLRenderer()
solarRenderer.setSize(320,320)

document.getElementById("solarSystem").appendChild(solarRenderer.domElement)

let sun = new THREE.Mesh(
new THREE.SphereGeometry(1,32,32),
new THREE.MeshBasicMaterial({color:0xffff00})
)

solarScene.add(sun)

let earthOrbit = new THREE.Mesh(
new THREE.SphereGeometry(0.3,16,16),
new THREE.MeshBasicMaterial({color:0x00aaff})
)

solarScene.add(earthOrbit)

let orbitRadius = 4
let angle = 0

let sunOn = true

function turnOffSun(){

sunOn=false

solarScene.remove(sun)

logEvent("Sonne ausgeschaltet")

setTimeout(()=>logEvent("Temperaturen beginnen zu fallen"),3000)

setTimeout(()=>logEvent("Erste Pflanzen sterben"),10000)

setTimeout(()=>logEvent("Ozeane beginnen zu gefrieren"),20000)

}

/* RESET */

function resetSimulation(){

location.reload()

}

/* ===== ANIMATION ===== */

function animate(){

requestAnimationFrame(animate)

earth.rotation.y += 0.0005

angle += 0.01

earthOrbit.position.x = Math.cos(angle)*orbitRadius
earthOrbit.position.z = Math.sin(angle)*orbitRadius

renderer.render(scene,camera)
solarRenderer.render(solarScene,solarCamera)

}

animate()
