import create from 'zustand';
import { getImage } from './images';
import { testNodes, fetchUserNFTBalances, fetchIssuedAssets, fetchAssets, fetchDynamicData } from './queries';
import { TransactionBuilder } from 'bitsharesjs';


/**
 * NFT_Viewer related
 */
const appStore = create(
    (set, get) => ({
      environment: null,
      mode: null,
      nodes: null,
      asset: null,
      asset_images: null,
      ipfsGateway: 'https://gateway.ipfs.io',
      asset_issuer: null,
      asset_quantity: null,
      asset_order_book: null,
      assets: null,
      searchResult: null,
      setEnvironment: (env) => set({environment: env}),
      setMode: (mode) => set({mode: mode}),
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
      setAsset: async (newAsset) => {
        const node = get().nodes[0];
        let dynamicData;
        try {
          dynamicData = await fetchDynamicData(node, newAsset);
        } catch (error) {
          console.log(error)
          return;
        }

        let description = newAsset
                          && newAsset.options.description
                          && newAsset.options.description.length
                          ? JSON.parse(newAsset.options.description) : undefined;
        let nft_object = description ? description.nft_object : undefined;

        let images;
        try {
          images = await getImage(nft_object)
        } catch (error) {
          console.log(error);
        }

        set({
          asset: newAsset,
          asset_images: images,
          asset_issuer: dynamicData.issuer,
          asset_quantity: dynamicData.quantity,
          asset_order_book: dynamicData.order_book
        })
      },
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
  
        console.log(response)

        if (response) {
          set({ assets: await response })
        }
      },
      changeURL: () => {
        console.log('Changing primary node');
        let nodesToChange = get().nodes;
        nodesToChange.push(nodesToChange.shift()); // Moving misbehaving node to end
        set({ nodes: nodesToChange })
      },
      clearAssets: () => set({
        assets: null
      }),
      back: () => set({
        mode: null,
        asset: null,
        asset_issuer: null,
        asset_quantity: null,
        asset_order_book: null
      }),
      reset: () => set({
          environment: null,
          mode: null,
          nodes: null,
          asset: null,
          asset_issuer: null,
          asset_quantity: null,
          asset_order_book: null,
          assets: null
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
    txBuilderInjected: null,
    setConnection: (res) => set({connection: res}),
    setTXBuilderInjection: () => {

    },
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