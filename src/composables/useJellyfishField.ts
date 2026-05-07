import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

const KEY: InjectionKey<{
  flashTick: Ref<number>
  flashAll: () => void
}> = Symbol('jellyfish-field')

export function provideJellyfishField() {
  const flashTick = ref(0)
  function flashAll() {
    flashTick.value += 1
  }
  provide(KEY, { flashTick, flashAll })
  return { flashTick, flashAll }
}

export function useJellyfishField() {
  const ctx = inject(KEY, null)
  return ctx
}
