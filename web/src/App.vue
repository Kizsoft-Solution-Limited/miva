<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <nav class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MIVA</p>
          <p class="text-sm text-slate-700">Milestone Verification Agent</p>
        </div>
        <div class="flex gap-4 text-sm font-medium">
          <RouterLink class="text-slate-700 hover:text-slate-900" to="/founder">Founder</RouterLink>
          <RouterLink class="text-slate-700 hover:text-slate-900" to="/investor">Investor</RouterLink>
        </div>
      </div>
    </nav>
    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
