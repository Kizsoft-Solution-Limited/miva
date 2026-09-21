<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Address, Hash } from 'viem'
import AppButton from '@/components/ui/AppButton.vue'
import {
  activateCreditForFounder,
  buyAndActivateForFounder,
  connectOrbioWallet,
  explorerTxUrl,
  quoteBuyAndActivate,
  type ActivationQuote,
} from '@/lib/orbio/activate'
import { shortAddress } from '@/lib/orbio/beneficiary'
import { walletErrorMessage } from '@/lib/orbio/wallet-error'

const props = defineProps<{
  wallet: string
  approved?: boolean
}>()

const copied = ref(false)
const account = ref<Address | null>(null)
const mode = ref<'buy' | 'activate'>('buy')
const amount = ref('5')
const quote = ref<ActivationQuote | null>(null)
const busy = ref(false)
const error = ref('')
const txHash = ref<Hash | null>(null)

const connectedShort = computed(() =>
  account.value ? shortAddress(account.value) : '',
)

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(props.wallet)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}

async function onConnect() {
  error.value = ''
  txHash.value = null
  busy.value = true
  try {
    account.value = await connectOrbioWallet()
  } catch (e) {
    error.value = walletErrorMessage(e, 'Could not connect wallet.')
  } finally {
    busy.value = false
  }
}

async function onQuote() {
  error.value = ''
  quote.value = null
  busy.value = true
  try {
    quote.value = await quoteBuyAndActivate(amount.value)
  } catch (e) {
    error.value = walletErrorMessage(e, 'Could not get quote.')
  } finally {
    busy.value = false
  }
}

async function onSend() {
  error.value = ''
  txHash.value = null
  if (!account.value) {
    error.value = 'Connect a wallet first.'
    return
  }
  busy.value = true
  try {
    if (mode.value === 'buy') {
      const q = quote.value || (await quoteBuyAndActivate(amount.value))
      quote.value = q
      txHash.value = await buyAndActivateForFounder({
        account: account.value,
        founderWallet: props.wallet,
        usdgAmount: amount.value,
        quote: q,
      })
    } else {
      txHash.value = await activateCreditForFounder({
        account: account.value,
        founderWallet: props.wallet,
        creditAmount: amount.value,
      })
    }
  } catch (e) {
    error.value = walletErrorMessage(e, 'Transaction failed.')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="surface space-y-4 p-4 sm:p-6">
    <div>
      <p class="eyebrow">{{ approved ? 'Send CREDIT' : 'Founder wallet' }}</p>
      <h2 class="text-xl font-medium text-[var(--ink)]">
        {{
          approved ? 'Activate for founder' : 'Where CREDIT goes if you approve'
        }}
      </h2>
      <p class="mt-1 text-sm text-[var(--muted)]">
        Buy &amp; activate on Robinhood Chain with the founder as beneficiary —
        same as Orbio’s “Credit another wallet.” MIVA never holds your funds.
      </p>
    </div>

    <div
      class="flex flex-wrap items-center gap-2 rounded-[10px] border border-[var(--line)] bg-black/20 px-3 py-2"
    >
      <code
        class="min-w-0 flex-1 break-all font-mono text-xs text-[var(--ink)]"
        >{{ wallet }}</code
      >
      <AppButton type="button" variant="secondary" @click="copyAddress">
        {{ copied ? 'Copied' : 'Copy' }}
      </AppButton>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
        :class="
          mode === 'buy'
            ? 'bg-[var(--signal)] text-[#052816]'
            : 'border border-[var(--line-strong)] text-[var(--muted)]'
        "
        @click="mode = 'buy'"
      >
        Buy USDG
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 12h12m0 0l-5-5m5 5l-5 5"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        activate
      </button>
      <button
        type="button"
        class="rounded-full px-3 py-1.5 text-xs font-bold"
        :class="
          mode === 'activate'
            ? 'bg-[var(--signal)] text-[#052816]'
            : 'border border-[var(--line-strong)] text-[var(--muted)]'
        "
        @click="mode = 'activate'"
      >
        I hold CREDIT
      </button>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label class="min-w-0 flex-1">
        <span class="mb-1 block text-xs font-bold text-[var(--muted)]">
          {{
            mode === 'buy'
              ? 'USDG to spend ($)'
              : 'CREDIT to activate ($1 each)'
          }}
        </span>
        <input
          v-model="amount"
          class="field w-full"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          :placeholder="mode === 'buy' ? 'e.g. 5' : 'e.g. 5'"
          :disabled="busy"
        />
      </label>
      <div class="flex shrink-0 flex-wrap gap-2">
        <AppButton
          type="button"
          variant="secondary"
          :disabled="busy"
          @click="onConnect"
        >
          {{ account ? connectedShort : 'Connect wallet' }}
        </AppButton>
        <AppButton
          v-if="mode === 'buy'"
          type="button"
          variant="secondary"
          :disabled="busy"
          @click="onQuote"
        >
          Quote
        </AppButton>
        <AppButton type="button" :disabled="busy || !account" @click="onSend">
          {{ mode === 'buy' ? 'Buy & activate' : 'Activate for founder' }}
        </AppButton>
      </div>
    </div>

    <p v-if="quote && mode === 'buy'" class="text-xs text-[var(--muted)]">
      Quote ≈ {{ quote.creditOutLabel }} CREDIT (~${{ quote.creditedLabel }} AI
      usage for founder after fee).
    </p>
    <p v-if="error" class="text-sm text-[var(--danger)]">{{ error }}</p>
    <p v-else-if="txHash" class="text-sm text-[var(--signal)]">
      Sent.
      <a
        class="underline underline-offset-2"
        :href="explorerTxUrl(txHash)"
        target="_blank"
        rel="noopener noreferrer"
        >View tx</a
      >
    </p>

    <p class="text-xs text-[var(--muted)]">
      Prefer the dashboard?
      <a
        class="underline underline-offset-2 hover:text-[var(--signal)]"
        href="https://www.orbio.so/protocol/agents#activate-credit"
        target="_blank"
        rel="noopener noreferrer"
        >Orbio activate docs</a
      >
    </p>
  </section>
</template>
