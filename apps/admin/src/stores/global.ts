import { defineStore } from 'pinia'

interface GlobalState {
  drawerPanel: 'menu' | 'notify' | 'upload' | null
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({
    drawerPanel: null
  }),
  getters: {},
  actions: {},
  // persist: true
})

export type DrawerPanel = GlobalState['drawerPanel']