const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
)

camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.PointLight(0xffffff,1)
light.position.set(5,3,5)
scene.add(light)

const loader = new THREE.TextureLoader()

const earthTexture = loader.load(
"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
)

const geometry = new THREE.SphereGeometry(1,64,64)
const material = new THREE.MeshStandardMaterial({map:earthTexture})

const earth = new THREE.Mesh(geometry,material)
scene.add(earth)

let marker = null

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

renderer.domElement.addEventListener("click",(event)=>{

mouse.x = (event.clientX/window.innerWidth)*2-1
mouse.y = -(event.clientY/window.innerHeight)*2+1

raycaster.setFromCamera(mouse,camera)

const intersects = raycaster.intersectObject(earth)

if(intersects.length>0){

const point = intersects[0].point

if(!marker){

const g = new THREE.SphereGeometry(0.03,16,16)
const m = new THREE.MeshBasicMaterial({color:0xff0000})

marker = new THREE.Mesh(g,m)

earth.add(marker)

}

marker.position.copy(point).normalize().multiplyScalar(1.01)

const lat = Math.asin(point.y/1)*(180/Math.PI)
const lon = Math.atan2(point.z,point.x)*(180/Math.PI)

getTemperature(lat,lon)

}

})

async function getTemperature(lat,lon){

const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`

const response = await fetch(url)
const data = await response.json()

const temps = data.hourly.temperature_2m.slice(0,24)

document.getElementById("temp").innerText =
"Temperature: "+temps[0]+" °C"

updateChart(temps)

}

const ctx = document.getElementById("chart").getContext("2d")

const chart = new Chart(ctx,{
type:"line",
data:{
labels:Array.from({length:24},(_,i)=>i+"h"),
datasets:[{
label:"Temperature °C",
data:[],
borderColor:"red",
fill:false
}]
},
options:{
responsive:true
}
})

function updateChart(temps){

chart.data.datasets[0].data = temps
chart.update()

}

function stars(){

const starGeometry = new THREE.BufferGeometry()
const starCount = 5000

const positions = []

for(let i=0;i<starCount;i++){

positions.push(
(Math.random()-0.5)*200,
(Math.random()-0.5)*200,
(Math.random()-0.5)*200
)

}

starGeometry.setAttribute(
"position",
new THREE.Float32BufferAttribute(positions,3)
)

const starMaterial = new THREE.PointsMaterial({color:0xffffff})

const stars = new THREE.Points(starGeometry,starMaterial)

scene.add(stars)

}

stars()

function animate(){

requestAnimationFrame(animate)

earth.rotation.y += 0.001

renderer.render(scene,camera)

}

animate()
