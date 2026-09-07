import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastTone = 'info' | 'warn' | 'ok'

export const useToastStore = defineStore('toast', () => {
  const message = ref<string | null>(null)
  const tone = ref<ToastTone>('info')
  let timer: ReturnType<typeof setTimeout> | undefined

  function clear() {
    message.value = null
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  function show(next: string, nextTone: ToastTone = 'info', ms = 4200) {
    message.value = next
    tone.value = nextTone
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = null
      timer = undefined
    }, ms)
  }

  return { message, tone, show, clear }
})
