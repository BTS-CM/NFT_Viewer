import create from 'zustand';
import { testNodes, fetchUserNFTBalances, fetchIssuedAssets, fetchAssets } from './queries';

/**
 * NFT_Viewer related
 */
const appStore = create(
    (set, get) => ({
      mode: null,
      asset: null,
      assets: null,
      environment: null,
      nodes: null,
      setMode: (mode) => set({mode: mode}),
      setAsset: (newAsset) => set({asset: newAsset}),
      fetchAssets: async (asset_ids) => {
        const node = get().nodes[0];
        let response;
        try {
          response = await fetchAssets(node, asset_ids);
        } catch (error) {
          console.log(error)
        }
  
        if (response) {
          set({ assets: await response })
        }
      },
      fetchIssuedAssets: async (accountID) => {
        const node = get().nodes[0];
        let response;
        try {
          response = await fetchIssuedAssets(node, accountID);
        } catch (error) {
          console.log(error)
        }
  
        if (response) {
          set({ assets: await response })
        }
      },
      fetchNFTBalances: async (accountID) => {
        const node = get().nodes[0];
        let response;
        try {
          response = await fetchUserNFTBalances(node, accountID);
        } catch (error) {
          console.log(error)
        }
  
        if (response) {
          set({ assets: await response })
        }
      },
      setFeaturedAssets: (newAssets) => set({featuredAssets: newAssets}),
      setEnvironment: (env) => set({environment: env}),
      setNodes: async () => {
        const env = get().environment;
        let response;
        try {
          response = await testNodes(env === 'production' ? 'BTS' : 'BTS_TEST');
        } catch (error) {
          console.log(error)
        }
  
        if (response) {
          set({ nodes: await response })
        }
      },
      changeURL: () => {
        let nodesToChange = get().nodes;
        nodesToChange.push(nodesToChange.shift()); // Moving misbehaving node to end
        set({ nodes: nodesToChange })
      },
      reset: () => set({
          mode: null,
          asset: null,
          connection: null,
          environment: null,
          nodes: null,
          assets: null,
          environment: null
      })
  })
);

/**
 * Beet wallet related
 */
const beetStore = create((set, get) => ({
    connection: null,
    authenticated: null,
    isLinked: null,
    identity: null,
    setConnection: (res) => set({connection: res}),
    setAuthenticated: (auth) => set({authenticated: auth}),
    setIsLinked: (link) => set({isLinked: link}),
    setIdentity: (id) => set({identity: id}),
    reset: () => set({
        authenticated: null,
        isLinked: null,
        identity: null
    })
}));

export {
    appStore,
    beetStore
};