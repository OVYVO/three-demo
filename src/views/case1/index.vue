<template>
  <div class="cas1-container">
    <canvas class="webgl"></canvas>
  </div>
</template>

<script setup>
// @ts-nocheck

import { onMounted, ref, onUnmounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare.js";
import { Water } from "three/examples/jsm/objects/Water";
import { Sky } from "three/examples/jsm/objects/Sky";
import waterTexture from "./images/waternormals.jpg";
import lensflareTexture0 from "./images/lensflare0.png";
import lensflareTexture1 from "./images/lensflare1.png";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";

import Animations from "./utils/animations";

const loadingProcess = ref(0);
const sceneReady = ref(false);

onMounted(() => {
  initThree();
});

onUnmounted(() => {
  window.removeEventListener("click", () => {});
});

const initThree = () => {
  // three对js中date的封装 https://blog.csdn.net/PirateRaccoon/article/details/121671307
  const clock = new THREE.Clock();
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas.webgl"),
    antialias: true, //抗锯齿
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 设置像素比
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(0, 600, 1600);

  // 后期
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const glitchPass = new GlitchPass();
  composer.addPass(glitchPass);

  // 页面缩放
  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  // 轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0); // 控制器的焦点
  controls.enableDamping = true; // 相机阻尼感
  controls.enablePan = false; //禁止相机水平移动
  controls.maxPolarAngle = 1.5; //垂直旋转的角度的上限
  controls.minDistance = 100; //将相机向内移动多少
  controls.maxDistance = 1000; //将相机向外移动多少

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(-1, 1.75, 1);
  dirLight.position.multiplyScalar(30);
  scene.add(dirLight);

  // 太阳点光源
  const pointLight = new THREE.PointLight(0xffffff, 1.2, 2000);
  pointLight.color.setHSL(0.995, 0.5, 0.9);
  pointLight.position.set(0, 250, -2000);
  const textureLoader = new THREE.TextureLoader();
  const textureFlare0 = textureLoader.load(lensflareTexture0);
  const textureFlare1 = textureLoader.load(lensflareTexture1);
  // 镜头光晕
  const lensflare = new Lensflare();
  lensflare.addElement(
    new LensflareElement(textureFlare0, 600, 0, pointLight.color)
  );
  lensflare.addElement(new LensflareElement(textureFlare1, 60, 0.6));
  lensflare.addElement(new LensflareElement(textureFlare1, 70, 0.7));
  lensflare.addElement(new LensflareElement(textureFlare1, 120, 0.9));
  lensflare.addElement(new LensflareElement(textureFlare1, 70, 1));
  pointLight.add(lensflare);
  scene.add(pointLight);

  // 添加水面 TextureLoader贴图加载器本质是imageLoader  Texture贴图
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000); //平面缓冲几何体
  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(waterTexture, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x0072ff,
    distortionScale: 4,
    fog: scene.fog !== undefined,
  });
  water.name = "water";
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // 添加天空
  const sky = new Sky();
  sky.name = "sky";
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 20;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  // 太阳
  const sun = new THREE.Vector3();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const phi = THREE.MathUtils.degToRad(89);
  const theta = THREE.MathUtils.degToRad(180);
  sun.setFromSphericalCoords(1, phi, theta);
  sky.material.uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();
  scene.environment = pmremGenerator.fromScene(sky).texture;

  const manager = new THREE.LoadingManager();
  manager.onProgress = async (url, loaded, total) => {
    if (Math.floor((loaded / total) * 100) === 100) {
      loadingProcess.value = Math.floor((loaded / total) * 100);
      Animations.animateCamera(
        camera,
        controls,
        { x: 0, y: 40, z: 140 },
        { x: 0, y: 0, z: 0 },
        4000,
        () => {
          sceneReady.value = true;
        }
      );
    } else {
      loadingProcess.value = Math.floor((loaded / total) * 100);
    }
  };

  // 岛
  const loader = new GLTFLoader(manager);
  loader.load("/models/island.glb", (mesh) => {
    mesh.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.metalness = 0.4;
        child.material.roughness = 0.6;
      }
    });
    mesh.scene.position.set(0, -2, 0);
    mesh.scene.scale.set(33, 33, 33);
    scene.add(mesh.scene);
  });

  const animate = () => {
    requestAnimationFrame(animate);
    water.material.uniforms["time"].value += 1.0 / 60.0;
    controls && controls.update();
    const timer = Date.now() * 0.0005;
    TWEEN && TWEEN.update();
    camera && (camera.position.z += Math.sin(timer) * 0.05);
    renderer.render(scene, camera);
  };
  animate();

  const chooseClick = (e) => {
    // 获取点击位置坐标
    let cx = e.clientX;
    let cy = e.clientY;
    // 将坐标转换成WebGL标准设备坐标
    let wx = (cx / window.innerWidth) * 2 - 1;
    let wy = -(cy / window.innerHeight) * 2 + 1;
    // 创建投射器
    const raycaster = new THREE.Raycaster();
    // 通过坐标以及投射相机计算射线投射器
    raycaster.setFromCamera(new THREE.Vector2(wx, wy), camera);
    // 返回投射器命中网格模型对象
    const intersects = raycaster.intersectObjects(scene.children);
    const targetArr = intersects.filter(
      (item) => !["water", "sky"].includes(item.object.name)
    );
    const objArr = Array.from(new Set(targetArr.map((item) => item.object)));
  };
  window.addEventListener("click", chooseClick, -1);
};
</script>

<style lang="less" scoped>
.cas1-container {
  width: 100vw;
  height: 100vh;
}
</style>
