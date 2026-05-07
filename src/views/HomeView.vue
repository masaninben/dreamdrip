<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import DeepSeaBackground from '@/components/DeepSeaBackground.vue'
</script>

<template>
  <AppLayout>
    <main class="relative flex flex-1 flex-col overflow-hidden">
      <DeepSeaBackground />

      <header class="relative z-10 px-6 pt-10 text-center">
        <p class="text-[11px] tracking-[0.5em] text-sky-100/50">DREAMDRIP</p>
        <h1 class="mt-2 text-base font-light tracking-[0.3em] text-sky-100/80">
          世界の夢が漂う場所
        </h1>
      </header>

      <section class="relative z-10 mt-auto mb-10 px-6">
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <p class="text-[11px] tracking-widest text-sky-100/45">FLOATING DREAM</p>
          <p class="mt-3 text-sm leading-relaxed text-sky-50/90">
            「未来の田舎町で友達夫婦といた」
          </p>
          <p class="mt-3 text-[11px] tracking-wider text-sky-200/60">
            #未来 #田舎 #別世界線
          </p>
        </div>
      </section>
    </main>
  </AppLayout>
</template>
