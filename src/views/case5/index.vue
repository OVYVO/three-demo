<template>
  <div class="dot-container">
    <canvas class="webgl"></canvas>
  </div>
</template>

<script setup>// @ts-nocheck
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import * as THREE from 'three'

let scene, camera, renderer
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let mouseX = 0, mouseY = 0

onMounted(()=>{
  initThree()
})

onBeforeUnmount(()=>{
  window.removeEventListener('resize', onWindowResize, false)
  document.removeEventListener('mousemove', onPointerMove, false )
})

const initThree = ()=>{
  const s_w = window.innerWidth
  const s_h = window.innerHeight
  const 
    SEPARATION = 100,
    AMOUNTX = 50,
    AMOUNTY = 50

  let count = 0
 
  // 新建场景
  scene = new THREE.Scene()
  

  // 新建摄像机
  camera = new THREE.PerspectiveCamera(75, s_w / s_h, 1, 10000)
  camera.position.z = 1000;
  camera.position.y = 1000;
  scene.add(camera)

  // 添加粒子
  const numParticles = AMOUNTX * AMOUNTY
  const positions = new Float32Array( numParticles * 3 )
  const scales = new Float32Array( numParticles )

  let i = 0, j = 0
  for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
    for ( let iy = 0; iy < AMOUNTY; iy ++ ) {
      positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ) // x
      positions[ i + 1 ] = 0; // y
      positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ) // z
      scales[ j ] = 1
      i += 3
      j ++
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3))
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

  const material = new THREE.ShaderMaterial({
    uniforms:{
      color: {value: new THREE.Color('#097bdb')}
    },
    vertexShader:`
      attribute float scale;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 2.0 );
        gl_PointSize = scale * ( 300.0 / - mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
        gl_FragColor = vec4( color, 1.0 );
      }
    `
  })
  const particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // 新建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl'),
    antialias: true //抗锯齿
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))// 设置像素比
  renderer.setSize(s_w, s_h)

  // 动画函数
  const animate = ()=>{
    requestAnimationFrame(animate)
    render()
  }
  const render = ()=>{
    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y = 300;
    camera.lookAt( scene.position );
    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;
    let i = 0, j = 0;
    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
      for ( let iy = 0; iy < AMOUNTY; iy ++ ) {
        positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) + ( Math.sin( ( iy + count ) * 0.5 ) * 50 )
        scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 20 + ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 20
        i += 3;
        j ++;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;
    renderer.render( scene, camera );
    count += 0.1;
  }
  animate()

  // 监听函数
 
  window.addEventListener('resize', onWindowResize, false)
  document.addEventListener('mousemove', onPointerMove, false )
}

const onPointerMove = ( event )=> {
  if ( event.isPrimary === false ) return;
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}
const onWindowResize = () => {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

</script>

<style lang="less" scoped>
@import './index.less';
</style>