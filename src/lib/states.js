import create from 'zustand'

const useStore = create((set) => ({
    beetIdentity: null,
    setBeetIdentity: (id) => set({beetIdentity: id}),
    environment: 'production',
    setEnvironment: (env) => set({environment: env}),
    prodNetwork: 'wss://eu.nodes.bitshares.ws',
    setProdNetwork: (url) => set({prodNetwork: url}),
    testNetwork: 'wss://node.testnet.bitshares.eu',
    setTestNetwork: (url) => set({testNetwork: url})
}))

export default useStore;