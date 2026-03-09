let scene = new THREE.Scene()

let camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
)

camera.position.z = 3

let renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

/* LICHT */

let sun = new THREE.PointLight(0xffffff,2)
sun.position.set(5,3,5)
scene.add(sun)

scene.add(new THREE.AmbientLight(0xffffff,0.2))

/* TEXTURE LOADER */

let loader = new THREE.TextureLoader()

let dayTexture = loader.load(
"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
)

let nightTexture = loader.load(
"https://threejs.org/examples/textures/planets/earth_lights_2048.png"
)

/* ERDE */

let earthGeo = new THREE.SphereGeometry(1,128,128)

let earthMat = new THREE.MeshPhongMaterial({
map:dayTexture,
emissiveMap:nightTexture,
emissive:new THREE.Color(0xffffff),
emissiveIntensity:0.4
})

let earth = new THREE.Mesh(earthGeo,earthMat)

scene.add(earth)

/* ATMOSPHÄRE */

let atmosphereGeo = new THREE.SphereGeometry(1.05,128,128)

let atmosphereMat = new THREE.MeshBasicMaterial({
color:0x66ccff,
transparent:true,
opacity:0.15
})

let atmosphere = new THREE.Mesh(atmosphereGeo,atmosphereMat)

scene.add(atmosphere)

/* MARKER */

let markerGeo = new THREE.SphereGeometry(0.03,16,16)

let markerMat = new THREE.MeshBasicMaterial({color:0xff0000})

let marker = new THREE.Mesh(markerGeo,markerMat)

earth.add(marker)

marker.visible=false

/* SATELLITEN */

let satellites=[]

for(let i=0;i<6;i++){

let satGeo = new THREE.BoxGeometry(0.03,0.03,0.08)
let satMat = new THREE.MeshBasicMaterial({color:0xffffff})

let sat = new THREE.Mesh(satGeo,satMat)

sat.userData.angle = Math.random()*Math.PI*2
sat.userData.radius = 1.5 + Math.random()*0.5
sat.userData.speed = 0.002 + Math.random()*0.003

scene.add(sat)

satellites.push(sat)

}

/* RAYCAST */

let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

window.addEventListener("click",(event)=>{

mouse.x = (event.clientX/window.innerWidth)*2-1
mouse.y = -(event.clientY/window.innerHeight)*2+1

raycaster.setFromCamera(mouse,camera)

let hit = raycaster.intersectObject(earth)

if(hit.length>0){

let worldPoint = hit[0].point.clone()

let local = earth.worldToLocal(worldPoint)

marker.position.copy(
local.normalize().multiplyScalar(1.02)
)

marker.visible=true

let lat = Math.asin(local.y)*(180/Math.PI)
let lon = Math.atan2(local.z,local.x)*(180/Math.PI)

loadWeather(lat,lon)

}

})

/* LIVE TEMPERATUR */

async function loadWeather(lat,lon){

let url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`

let res = await fetch(url)

let data = await res.json()

let temp = data.current.temperature_2m

document.getElementById("tempDisplay").innerText =
"Temperatur: "+temp+" °C"

addGraph(temp)

}

/* GRAPH */

let canvas = document.getElementById("graph")
let ctx = canvas.getContext("2d")

canvas.width=300
canvas.height=150

let temps=[]

function addGraph(temp){

temps.push(temp)

if(temps.length>30) temps.shift()

ctx.clearRect(0,0,300,150)

ctx.beginPath()

for(let i=0;i<temps.length;i++){

let x=i*10
let y=150-(temps[i]*3)

if(i===0) ctx.moveTo(x,y)
else ctx.lineTo(x,y)

}

ctx.strokeStyle="red"
ctx.stroke()

}

/* GLOBUS STEUERUNG */

let dragging=false
let prevX=0
let prevY=0

window.addEventListener("mousedown",(e)=>{

dragging=true
prevX=e.clientX
prevY=e.clientY

})

window.addEventListener("mouseup",()=>{

dragging=false

})

window.addEventListener("mousemove",(e)=>{

if(!dragging) return

let dx=e.clientX-prevX
let dy=e.clientY-prevY

earth.rotation.y += dx*0.005
earth.rotation.x += dy*0.005

atmosphere.rotation.copy(earth.rotation)

prevX=e.clientX
prevY=e.clientY

})

/* ANIMATION */

function animate(){

requestAnimationFrame(animate)

/* ERDDREHUNG */

earth.rotation.y += 0.0005
atmosphere.rotation.y += 0.0005

/* SATELLITEN ORBITS */

satellites.forEach(s=>{

s.userData.angle += s.userData.speed

s.position.x = Math.cos(s.userData.angle)*s.userData.radius
s.position.z = Math.sin(s.userData.angle)*s.userData.radius
s.position.y = Math.sin(s.userData.angle*0.5)*0.5

})

renderer.render(scene,camera)

}

animate()
