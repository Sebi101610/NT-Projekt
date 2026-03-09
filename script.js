let scene = new THREE.Scene()

let camera = new THREE.PerspectiveCamera(
60,
window.innerWidth / window.innerHeight,
0.1,
1000
)

camera.position.z = 3

let renderer = new THREE.WebGLRenderer({ antialias:true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

/* LICHT */

let light = new THREE.PointLight(0xffffff,1.5)
light.position.set(5,3,5)
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff,0.4))

/* TEXTURE */

let textureLoader = new THREE.TextureLoader()

let earthTexture = textureLoader.load(
"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
)

/* ERDE */

let earthGeometry = new THREE.SphereGeometry(1,64,64)

let earthMaterial = new THREE.MeshPhongMaterial({
map: earthTexture
})

let earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

/* MARKER */

let markerGeometry = new THREE.SphereGeometry(0.03,16,16)
let markerMaterial = new THREE.MeshBasicMaterial({color:0xff0000})

let marker = new THREE.Mesh(markerGeometry, markerMaterial)

earth.add(marker)
marker.visible = false

/* SATELLITEN */

let satellites=[]

for(let i=0;i<5;i++){

let geo = new THREE.BoxGeometry(0.04,0.04,0.1)
let mat = new THREE.MeshBasicMaterial({color:0xffffff})

let sat = new THREE.Mesh(geo,mat)

sat.userData.angle = Math.random()*Math.PI*2
sat.userData.radius = 1.6
sat.userData.speed = 0.002 + Math.random()*0.002

scene.add(sat)

satellites.push(sat)

}

/* RAYCAST */

let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

window.addEventListener("click",(event)=>{

mouse.x = (event.clientX / window.innerWidth) * 2 - 1
mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

raycaster.setFromCamera(mouse, camera)

let intersects = raycaster.intersectObject(earth)

if(intersects.length > 0){

let worldPoint = intersects[0].point.clone()

let localPoint = earth.worldToLocal(worldPoint)

marker.position.copy(
localPoint.normalize().multiplyScalar(1.02)
)

marker.visible = true

let lat = Math.asin(localPoint.y)*(180/Math.PI)
let lon = Math.atan2(localPoint.z,localPoint.x)*(180/Math.PI)

loadWeather(lat,lon)

}

})

/* TEMPERATUR */

async function loadWeather(lat,lon){

try{

let url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`

let response = await fetch(url)

let data = await response.json()

let temp = data.current.temperature_2m

document.getElementById("tempDisplay").innerText =
"Temperatur: "+temp+" °C"

}catch(e){

document.getElementById("tempDisplay").innerText =
"Temperatur konnte nicht geladen werden"

}

}

/* GLOBUS DREHEN */

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

let dx = e.clientX - prevX
let dy = e.clientY - prevY

earth.rotation.y += dx*0.005
earth.rotation.x += dy*0.005

prevX = e.clientX
prevY = e.clientY

})

/* ANIMATION */

function animate(){

requestAnimationFrame(animate)

/* ERDDREHUNG */

earth.rotation.y += 0.0005

/* SATELLITEN */

satellites.forEach(s=>{

s.userData.angle += s.userData.speed

s.position.x = Math.cos(s.userData.angle) * s.userData.radius
s.position.z = Math.sin(s.userData.angle) * s.userData.radius
s.position.y = Math.sin(s.userData.angle*0.5) * 0.5

})

renderer.render(scene,camera)

}

animate()
