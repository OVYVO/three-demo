<template>
  <div class="index-nav-bar">
    <div class="index-bar-item" v-for="item in navBar" :key="item.path">
      <router-link :to="{ path: item.path }">
        {{ item.name }}
      </router-link>
    </div>
  </div>
  <router-view></router-view>
</template>

<script setup>
import { ref } from "vue";

const navBar = ref([
  { name: "海岛", path: "/" },
  { name: "地球", path: "/case2" },
  { name: "雕塑", path: "/case3" },
  { name: "卡越", path: "/case4" },
  { name: "文字", path: "/case6" },
]);
</script>

<style lang="less">
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}
.index-nav-bar {
  display: flex;
  background: #fff;
  box-sizing: border-box;
  padding: 6px;
  position: relative;
  z-index: 9999;
  .index-bar-item {
    font-size: 14px;
    padding: 6px 10px;
    background: purple;
    margin-right: 6px;
  }
}
</style>
