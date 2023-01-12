import create from 'zustand';
import { persist } from 'zustand/middleware';
import { connect, checkBeet, link } from 'beet-js';

import { getImage } from './images';
import { 
  testNodes,
  fetchUserNFTBalances,
  fetchIssuedAssets,
  fetchAssets,
  fetchDynamicData
} from './queries';

const identitiesStore = create(
  persist((set, get) => ({
    identities: [],
    storedConnections: {},
    storeConnection: (connection) => {
      if (!connection || !connection.identity) {
        return;
      }
      const currentConnections = get().storedConnections;
      if (!currentConnections[connection.identity.identityhash]) {
        currentConnections[connection.identity.identityhash] = {
          beetkey: connection.beetkey,
          next_identification: connection.next_identification,
          secret: connection.secret,
        };
        set({ storedConnections: currentConnections });
      }
    },
    removeConnection: (identityhash) => {
      const currentConnections = get().storedConnections;
      if (currentConnections[identityhash]) {
        delete currentConnections[identityhash];
        set({ storedConnections: currentConnections });
      }
    },
    setIdentities: (identity) => {
      if (!identity) {
        return;
      }

      let currentIdentities = get().identities;

      if (currentIdentities.find(id => 
        id.identityHash === identity.identityHash
        && id.requested.account.id === identity.requested.account.id
      )) {
        console.log('Account already linked')
        return;
      }
      
      currentIdentities.push(identity);
      set({identities: currentIdentities});
    },
    removeIdentity: (accountID) => {
      if (!accountID) {
        return;
      }
      let currentIdentities = get().identities;
      let newIdentities = currentIdentities.filter(x => x.requested.account.id != accountID);
      set({identities: newIdentities});
    }
  }))
);

/**
 * NFT_Viewer related
 */
const appStore = create(
    (set, get) => ({
      environment: null,
      mode: null,
      nodes: null,
      asset: null,
      account: null,
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
        if (!env) {
          console.log('No env set');
          return;
        }

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
      setAccount: (newAccount) => set({account: newAccount}),
      setAssetImages: (images) =>  set({asset_images: images}),
      fetchAssets: async (asset_ids) => {
        /**
         * Looking asset data from an array of IDs
         * @param {Array} asset_ids
         */
        const node = get().nodes;

        if (!node || !node.length) { 
          //console.log('No nodes')
          return;
        }

        let response;
        try {
          response = await fetchAssets(node[0], asset_ids);
        } catch (error) {
          console.log(error)
        }
  
        if (response) {
          set({ assets: await response })
        }
      },
      fetchIssuedAssets: async (accountID) => {
        /**
         * Fetching the assets issued by the provided account ID
         * @param {String} accountID
         */
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
      changeURL: () => {
        /**
         * The current node url isn't healthy anymore
         * shift it to the back of the queue
         */
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
        assets: null,
        account: null,
        asset_issuer: null,
        asset_quantity: null,
        asset_order_book: null
      }),
      reset: () => set({
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
        searchResult: null
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
    connect: async (identity) => {
      /**
       * Connect to and authenticate with the Beet client
       * @param {Object} identity
       */
      let beetOnline;
      try {
        beetOnline = await checkBeet(true);
      } catch (error) {
        console.log(error);
      }
  
      if (!beetOnline) {
        console.log('beet not online')
        return;
      }
  
      let connected;
      try {
        connected = await connect(
          "NFT Viewer",
          "Application",
          "localhost",
          null,
          identity ?? null
        );
      } catch (error) {
        console.error(error)
      }

      if (!connected) {
        console.error("Couldn't connect to Beet");
        set({
          connection: null,
          authenticated: null,
          isLinked: null
        })
        return;
      }

      set({
        connection: connected,
        authenticated: true,
        isLinked: false
      });
    },
    link: async (environment) => {
      /**
       * Re/Link to Beet wallet
       * @param {String} environment
       */
      let currentConnection = get().connection;

      let linkAttempt;
      try {
        linkAttempt = await link(environment === 'production' ? 'BTS' : 'BTS_TEST', currentConnection);
      } catch (error) {
        console.error(error)
        set({ isLinked: null, identity: null })
        return;
      }

      if (!currentConnection.identity) {
        set({ isLinked: null, identity: null })
        return;
      }

      const { storeConnection } = identitiesStore.getState();

      try {
        storeConnection(currentConnection);
      } catch (error) {
        console.log(error);
      }
      
      const { setAccount } = appStore.getState();
      try {
        setAccount(currentConnection.identity.requested.account.id);
      } catch (error) {
        console.log(error);
      }

      set({ isLinked: true, identity: currentConnection.identity })
    },
    setConnection: (res) => set({connection: res}),
    setAuthenticated: (auth) => set({authenticated: auth}),
    setIsLinked: (link) => set({isLinked: link}),
    setIdentity: (id) => set({identity: id}),
    reset: () => set({
      connection: null,
      authenticated: null,
      isLinked: null,
      identity: null,
    })
}));

export {
  appStore,
  beetStore,
  identitiesStore
};