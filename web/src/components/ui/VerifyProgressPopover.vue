<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  busy: boolean
  title?: string
}>()

const visible = ref(false)
const percent = ref(0)
const doneFlash = ref(false)
let timer: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const steps = [
  { at: 0, label: 'Reading claim and proof' },
  { at: 18, label: 'Checking live sources' },
  { at: 42, label: 'Web search / PDF if needed' },
  { at: 68, label: 'Building structured verdict' },
  { at: 90, label: 'Almost there…' },
]

const activeLabel = computed(() => {
  let label = steps[0]!.label
  for (const step of steps) {
    if (percent.value >= step.at) label = step.label
  }
  if (doneFlash.value) return 'Verdict ready'
  return label
})

function clearTimers() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function start() {
  clearTimers()
  visible.value = true
  doneFlash.value = false
  percent.value = 2
  timer = setInterval(() => {
    const p = percent.value
    if (p >= 92) return
    const step = p < 30 ? 2.4 : p < 60 ? 1.6 : p < 80 ? 0.9 : 0.35
    percent.value = Math.min(92, Math.round((p + step) * 10) / 10)
  }, 280)
}

function finish() {
  clearTimers()
  percent.value = 100
  doneFlash.value = true
  hideTimer = setTimeout(() => {
    visible.value = false
    doneFlash.value = false
    percent.value = 0
  }, 450)
}

watch(
  () => props.busy,
  (busy, wasBusy) => {
    if (busy) start()
    else if (wasBusy) finish()
  },
  { immediate: true },
)

onUnmounted(clearTimers)

const displayPercent = computed(() => Math.min(100, Math.round(percent.value)))
</script>

<template>
  <Teleport to="body">
    <Transition name="verify-pop">
      <div
        v-if="visible"
        class="verify-pop"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="verify-pop__card">
          <p class="verify-pop__eyebrow font-mono">orbio · verifying</p>
          <h2 class="verify-pop__title">{{ title || 'Running check' }}</h2>
          <p class="verify-pop__pct font-mono" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="displayPercent">
            {{ displayPercent }}%
          </p>
          <div class="verify-pop__track" aria-hidden="true">
            <div class="verify-pop__bar" :style="{ width: `${displayPercent}%` }" />
          </div>
          <p class="verify-pop__step">{{ activeLabel }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
