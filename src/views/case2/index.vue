<template>
  <div class="earth-container">
    <canvas class="webgl"></canvas>
  </div>
</template>

<script setup> // @ts-nocheck

import { onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; 
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import Animations from '../case1/utils/animations';
import EarthTexture from './images/earth.jpg'

onMounted(()=>{
  initThree()
})

const initThree = ()=>{
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
  camera.position.set(100, 100, 100)
  camera.lookAt(0,0,0)

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl'),
    antialias: true //抗锯齿
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enableZoom = true
  controls.autoRotate = false
  controls.autoRotateSpeed = 2
  controls.enablePan = true

  // let sphere = null
  // const TextureLoader = new THREE.TextureLoader();
  // TextureLoader.load(EarthTexture, texture=>{
  //   const geometry = new THREE.SphereGeometry( 40, 64, 32 );
  //   const material = new THREE.MeshBasicMaterial({
  //     map: texture
  //   })
  //   sphere = new THREE.Mesh( geometry, material );
  //   scene.add( sphere );
  // })

  const loader = new GLTFLoader();
  loader.load('/models/starv.glb', mesh => {
    mesh.scene.position.set(-20, -20, -60);
    scene.add(mesh.scene);
  });

  const axesHelper = new THREE.AxesHelper( 10000 );
  scene.add( axesHelper );

  const pointLight = new THREE.PointLight( 0x404040, 20, 160 );
  pointLight.position.set( 50, 50, 50 );
  scene.add( pointLight );

  const sphereSize = 1;
  const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
  scene.add( pointLightHelper );


  const animate = () => {
    requestAnimationFrame(animate)
    TWEEN && TWEEN.update();
    renderer.render(scene, camera)
  }
  animate();
}

</script>

<style lang="less" scoped>
.earth-container{
  width: 100vw;
  height: 100vh;
}
</style>