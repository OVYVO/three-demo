<template>
  <div class="star-container">
    <div class="webgl-wrap" ref="webglWrapDom">
      <canvas id="webgl"></canvas>
    </div>
    <div class="info-wrap wow fadeInLeft">
      <p class="title">卡越星球</p>
      <p class="pinyin">KA YUE PLANET</p>
      <p class="sub">探索更多成长领域</p>
    </div>
    <div class="cloud">
      <div class="cloud-item cloud1"></div>
      <div class="cloud-item cloud2"></div>
      <div class="cloud-item cloud3"></div>
    </div>
    <div class="astronaut"></div>
    <div class="card-list">
      <div class="card-item card-item-1">
        <img src="./images/saishi.png" alt="" />
      </div>
      <div class="card-item card-item-2">
        <img src="./images/yanxue.png" alt="" />
      </div>
      <div class="card-item card-item-3">
        <img src="./images/kecheng.png" alt="" />
      </div>
      <div class="card-item card-item-4">
        <img src="./images/yuemi.png" alt="" />
      </div>
    </div>
    <div class="toast" v-if="showToast">暂未开放，敬请期待</div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  sRGBEncoding,
  AnimationMixer,
  DirectionalLight,
  Color,
  PCFSoftShadowMap,
  Raycaster,
  Vector2,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useRouter } from "vue-router";

const rem = (size = 750) => {
  if (typeof window === "undefined") return;

  function adjustScreen() {
    document.documentElement.style.fontSize =
      Math.min(100, 100 * (document.documentElement.clientWidth / size)) + "px";
  }
  adjustScreen();
  window.addEventListener(
    "orientationchange" in window ? "orientationchange" : "resize",
    adjustScreen,
    false
  );
};
rem(1920);

let webglWrapDom = ref(null);
let showToast = ref(false);
let camera = null;
let renderer = null;
const router = useRouter();

onMounted(() => {
  initThree();
});

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize, false);
});

const initThree = () => {
  const w = webglWrapDom.value.clientWidth;
  const h = webglWrapDom.value.clientHeight;

  // 创建场景
  const scene = new Scene();
  scene.name = "star";

  // 创建摄像机
  camera = new PerspectiveCamera(45, w / h, 1, 1000);
  camera.position.set(0, 0, 430);
  scene.add(camera);

  // 渲染器
  renderer = new WebGLRenderer({
    canvas: document.querySelector("#webgl"),
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.autoClear = true;
  renderer.outputEncoding = sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  // 光源
  const lightColor = new Color("rgb(255, 255, 230)");
  const directionalLight1 = new DirectionalLight(lightColor, 0.8);
  directionalLight1.position.set(-173, 0, 100);
  directionalLight1.castShadow = true;
  directionalLight1.shadow.mapSize.width = 20; // default
  directionalLight1.shadow.mapSize.height = 20; // default
  directionalLight1.shadow.camera.near = 0.5; // default
  directionalLight1.shadow.camera.far = 100; // default
  scene.add(directionalLight1);

  const directionalLight2 = new DirectionalLight(lightColor, 1.4);
  directionalLight2.position.set(173, 0, 100);
  directionalLight2.castShadow = true;
  scene.add(directionalLight2);

  const directionalLight3 = new DirectionalLight(lightColor, 0.8);
  directionalLight3.position.set(0, 0, -200);
  directionalLight3.castShadow = true;
  scene.add(directionalLight3);

  // 加载模型
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  dracoLoader.setDecoderConfig({ type: "js" });
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load("/models/star.glb", (mesh) => {
    document.querySelector(".webgl-wrap").style.zIndex = 2;
    mesh.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.metalness = 0.4;
        child.material.roughness = 0.6;
      }
    });
    scene.add(mesh.scene);
    const mixer = new AnimationMixer(mesh.scene);
    mixer.clipAction(mesh.animations[0]).play();
  });

  // 页面resize监控
  window.addEventListener("resize", onWindowResize, false);

  // 添加控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2;
  controls.enablePan = true;
  controls.enabled = true;

  // 点击事件
  const onWebGlClick = (e) => {
    const l = webglWrapDom.value.offsetLeft;
    const t = webglWrapDom.value.offsetTop;
    // 获取点击位置坐标
    let cx = e.clientX - l;
    let cy = e.clientY - t;
    // 将坐标转换成WebGL标准设备坐标
    let wx = (cx / w) * 2 - 1;
    let wy = -(cy / h) * 2 + 1;
    // 创建投射器
    const raycaster = new Raycaster();
    // 通过坐标以及投射相机计算射线投射器
    raycaster.setFromCamera(new Vector2(wx, wy), camera);
    // 返回投射器命中网格模型对象
    const intersects = raycaster.intersectObjects(scene.children);
    const targetArr = intersects.filter(
      (item) => !["星球001"].includes(item.object.name)
    );
    const obj = Array.from(new Set(targetArr.map((item) => item.object)))[0];
    const target = isClickParent(obj);
    switch (target && target.name) {
      case "商城": {
        toast();
        break;
      }
      case "研学基地": {
        break;
      }
      case "空间站":
      case "空间站1": {
        toast();
        break;
      }
      case "课程中心":
      case "课程中心1": {
        break;
      }
      case "赛事中心": {
        break;
      }
      default: {
        break;
      }
    }
  };
  renderer.domElement.addEventListener("click", onWebGlClick, -1);

  // 渲染动画
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
};
const isClickParent = (obj) => {
  const targetSection = [
    "商城",
    "研学基地",
    "空间站",
    "空间站1",
    "课程中心",
    "课程中心1",
    "赛事中心",
  ];
  if (obj?.name && targetSection.includes(obj.name)) {
    return obj;
  } else if (obj && obj.parent) {
    return isClickParent(obj.parent);
  } else {
    return null;
  }
};
const toast = () => {
  showToast.value = true;
  const time = setTimeout(() => {
    showToast.value = false;
    clearTimeout(time);
  }, 3000);
};
const onWindowResize = () => {
  const cw = document.querySelector(".webgl-wrap").clientWidth;
  const ch = document.querySelector(".webgl-wrap").clientHeight;
  camera.aspect = cw / ch;
  camera.updateProjectionMatrix();
  renderer.setSize(cw, ch);
};
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
