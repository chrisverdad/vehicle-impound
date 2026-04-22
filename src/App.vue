<script setup lang="ts">
import { ref } from 'vue';
import ImpoundList from './components/ImpoundList.vue';
import StatsView from './components/StatsView.vue';

const showStats = ref(true);
const goToImpound = () => (showStats.value = false);
const goToStats = () => (showStats.value = true);
</script>

<template>
  <div>
    <StatsView v-if="showStats" @navigate-to-impound="goToImpound" />

    <div v-else>
      <ImpoundList @navigate-to-stats="goToStats" />
    </div>
  </div>
</template>

<style scoped>
</style>
