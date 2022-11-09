<template>
  <div class="dot-container">

  </div>
</template>

<script setup>// @ts-nocheck
import * as THREE from 'three'

onMounted(()=>{
  initThree()
})

const initThree = ()=>{
  const s_w = window.innerWidth
  const s_h = window.innerHeight
  console.log(s_w,s_h)
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>