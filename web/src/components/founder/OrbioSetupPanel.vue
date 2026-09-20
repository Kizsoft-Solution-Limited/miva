<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useRoleStore } from '@/stores/role'

const roleStore = useRoleStore()
const apiKey = ref('')
const address = ref(roleStore.walletAddress || '')
const keyError = ref('')
const walletError = ref('')
const keySaved = ref(false)
const walletSaved = ref(false)
const open = ref(!roleStore.hasOrbioKey || !roleStore.walletAddress)

async function onSaveKey() {
  keyError.value = ''
  keySaved.value = false
  const key = apiKey.value.trim()
  if (!key) {
    keyError.value = 'Paste your Orbio key first.'
    return
  }
  try {
    await roleStore.saveOrbioKey(key)
    apiKey.value = ''
    keySaved.value = true
  } catch {
    keyError.value = roleStore.error || 'Could not save Orbio key.'
  }
}

async function onClearKey() {
  keyError.value = ''
  keySaved.value = false
  try {
    await roleStore.removeOrbioKey()
  } catch {
    keyError.value = roleStore.error || 'Could not clear Orbio key.'
  }
}

async function onSaveWallet() {
  walletError.value = ''
  walletSaved.value = false
  const next = address.value.trim()
  if (!next) {
    walletError.value = 'Paste a 0x wallet address first.'
    return
  }
  try {
    await roleStore.saveWallet(next)
    address.value = roleStore.walletAddress || next
    walletSaved.value = true
  } catch {
    walletError.value = roleStore.error || 'Could not save wallet.'
  }
}

async function onClearWallet() {
  walletError.value = ''
  walletSaved.value = false
  try {
    await roleStore.removeWallet()
    address.value = ''
  } catch {
    walletError.value = roleStore.error || 'Could not clear wallet.'
  }
}
</script>

<template>
  <section class="surface overflow-hidden">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      :aria-expanded="open"
      @click="open = !open"
    >
      <div>
        <p class="eyebrow">Orbio</p>
        <p class="text-sm font-bold text-[var(--ink)]">
          Key for checks · wallet for payouts
        </p>
        <p class="mt-0.5 text-xs text-[var(--muted)]">
          <span v-if="roleStore.hasOrbioKey">Key saved</span>
          <span v-else>No key yet</span>
          <span aria-hidden="true"> · </span>
          <span v-if="roleStore.walletAddress">Wallet set</span>
          <span v-else>No wallet yet</span>
        </p>
      </div>
      <span class="text-sm font-bold text-[var(--muted)]">{{
        open ? 'Hide' : 'Edit'
      }}</span>
    </button>

    <div v-if="open" class="space-y-5 border-t border-[var(--line)] px-5 py-4">
      <div class="space-y-2">
        <p class="text-sm font-bold text-[var(--ink)]">CREDIT key</p>
        <p class="text-xs text-[var(--muted)]">
          Claim on
          <a
            class="underline underline-offset-2 hover:text-[var(--signal)]"
            href="https://www.orbio.so"
            target="_blank"
            rel="noopener noreferrer"
            >orbio.so</a
          >, paste here. Stored encrypted on the server.
        </p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label class="min-w-0 flex-1">
            <span class="sr-only">Orbio API key</span>
            <input
              v-model="apiKey"
              class="field w-full"
              type="password"
              autocomplete="off"
              spellcheck="false"
              placeholder="sk-orbio-…"
              :disabled="roleStore.busy"
            />
          </label>
          <div class="flex shrink-0 gap-2">
            <AppButton
              type="button"
              :disabled="roleStore.busy"
              @click="onSaveKey"
            >
              Save key
            </AppButton>
            <AppButton
              v-if="roleStore.hasOrbioKey"
              type="button"
              variant="secondary"
              :disabled="roleStore.busy"
              @click="onClearKey"
            >
              Clear
            </AppButton>
          </div>
        </div>
        <p v-if="keyError" class="text-sm text-[var(--danger)]">
          {{ keyError }}
        </p>
        <p v-else-if="keySaved" class="text-sm text-[var(--signal)]">
          Key saved.
        </p>
      </div>

      <div class="space-y-2 border-t border-[var(--line)] pt-4">
        <p class="text-sm font-bold text-[var(--ink)]">Payout wallet</p>
        <p class="text-xs text-[var(--muted)]">
          Investors buy &amp; activate CREDIT to this 0x in MIVA (or on Orbio).
          We don’t move funds.
        </p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label class="min-w-0 flex-1">
            <span class="sr-only">Wallet address</span>
            <input
              v-model="address"
              class="field w-full font-mono text-sm"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="0x…"
              :disabled="roleStore.busy"
            />
          </label>
          <div class="flex shrink-0 gap-2">
            <AppButton
              type="button"
              :disabled="roleStore.busy"
              @click="onSaveWallet"
            >
              Save wallet
            </AppButton>
            <AppButton
              v-if="roleStore.walletAddress"
              type="button"
              variant="secondary"
              :disabled="roleStore.busy"
              @click="onClearWallet"
            >
              Clear
            </AppButton>
          </div>
        </div>
        <p v-if="walletError" class="text-sm text-[var(--danger)]">
          {{ walletError }}
        </p>
        <p v-else-if="walletSaved" class="text-sm text-[var(--signal)]">
          Wallet saved.
        </p>
      </div>
    </div>
  </section>
</template>
