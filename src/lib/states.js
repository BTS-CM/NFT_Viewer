
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getImages } from './images';
import config from '../config/config.json';

const nonNFTStore = create(
  persist(
    (set, get) => ({
      bitshares: [],
      bitshares_testnet: [],
      changeNonNFTs: (env, newAssets) => {
        const newObj = {};
        newObj[env] = newAssets;
        set(newObj);
      },
      addOne: (env, newAsset) => {
        const currentAssets = get()[env];
        currentAssets.push(newAsset);
        const newObj = {};
        newObj[env] = currentAssets;
        set(newObj);
      },
      eraseAssets: (env) => {
        console.log(`Erasing ${env} stored non NFT assets!`);
        const newObj = {};
        newObj[env] = [];
        set(newObj);
      },
    }),
    {
      name: 'nonNFTStore',
    },
  ),
);

// Storing asset names and precision values
const assetStore = create(
  persist(
    (set, get) => ({
      bitshares: [],
      bitshares_testnet: [],
      changeAssets: (env, newAssets) => {
        const newObj = {};
        newObj[env] = newAssets;
        set(newObj);
      },
      addOne: (env, newAsset) => {
        const currentAssets = get()[env];
        currentAssets.push(newAsset);
        const newObj = {};
        newObj[env] = currentAssets;
        set(newObj);
      },
      eraseAssets: (env) => {
        console.log(`Erasing ${env} stored assets!`);
        const newObj = {};
        newObj[env] = [];
        set(newObj);
      },
    }),
    {
      name: 'assetStorage',
    },
  ),
);

const favouritesStore = create(
  persist(
    (set, get) => ({
      favourites: [],
      addFavourite: (newFavourite) => {
        if (!newFavourite) {
          return;
        }
        let currentFavourites = get().favourites;
        if (currentFavourites.find(x => x.id === newFavourite.id)) {
          console.log('Already favourited this item!');
          return;
        }
        currentFavourites.push(newFavourite);
        set({ favourites: currentFavourites });
      },
      addFavouriteAccount: async (node, env, newFavourite) => {
        if (!newFavourite) {
          return;
        }
        
        let currentFavourites = get().favourites;
        if (currentFavourites.find(x => x.id === newFavourite)) {
          console.log('Already favourited this item!');
          return;
        }

        let searchResult;
        try {
          searchResult = await window.electron.fetchObject(node, newFavourite);
        } catch (error) {
          console.log(error);
          return;
        }
    
        if (!searchResult || !searchResult.length) {
          console.log({msg: "Couldn't find account", newFavourite});
          return;
        }
        
        currentFavourites.push({
          name: searchResult[0].name,
          id: searchResult[0].id,
          chain: env === 'bitshares' ? 'BTS' : 'BTS_TEST'
        });
      },
      removeFavourite: (oldFavourite) => {
        if (!oldFavourite) {
          return;
        }
        
        console.log('Removing favourite: ' + oldFavourite)

        let currentFavourites = get().favourites;
        if (!currentFavourites.find(x => x.id === oldFavourite)) {
          console.log('This item is not favourited!');
          return;
        }

        let newFavourites = currentFavourites.filter(x => x.id != oldFavourite);
        set({ favourites: newFavourites });
      }
    }),
    {
      name: 'favourites'
    }
  )
);

const localePreferenceStore = create(
  persist(
    (set, get) => ({
      locale: 'en',
      ipfsGateway: 'https://gateway.ipfs.io',
      changeLocale: (lng) => {
        console.log(`Saving preferred locale: ${lng}`);
        set({ locale: lng });
      },
      changeIPFSGateway: (gateway) => {
        console.log(`Saving preferred IPFS gateway: ${gateway}`);
        set({ ipfsGateway: gateway });
      },
    }),
    {
      name: 'locale-preference'
    }
  )
);

const identitiesStore = create(
  persist((set, get) => ({
    identities: [],
    storedConnections: {},
    storeConnection: (connection) => {
      if (!connection || !connection.identity) {
        return;
      }
      const currentConnections = get().storedConnections;
      if (!currentConnections || !currentConnections[connection.identity.identityhash]) {
        // storing new linked connection
        currentConnections[connection.identity.identityhash] = {
          beetkey: connection.beetkey,
          next_identification: connection.next_identification,
          secret: connection.secret,
        };
        set({ storedConnections: currentConnections });
      } else if (currentConnections && currentConnections[connection.identity.identityhash]) {
        // updating existing linked connection
        currentConnections[connection.identity.identityhash].beetkey = connection.beetkey;
        currentConnections[connection.identity.identityhash].next_identification = connection.next_identification;
        currentConnections[connection.identity.identityhash].secret = connection.secret;
        set({ storedConnections: currentConnections });
      }
    },
    getStoredIds: (identityhash) => {
      const currentConnections = get().storedConnections;
      if (currentConnections && currentConnections[identityhash]) {
        return currentConnections[identityhash];
      }
      return null;
    },
    removeConnection: (identityhash) => {
      const currentConnections = get().storedConnections;
      if (currentConnections && currentConnections[identityhash]) {
        delete currentConnections[identityhash];
        set({ storedConnections: currentConnections });
      }
    },
    setIdentities: (newIdentity) => {
      if (!newIdentity) {
        console.log("No identity provided");
        return;
      }

      console.log("Setting identity");

      let currentIdentities = get().identities;
      if (
        currentIdentities
        && currentIdentities.length
        && currentIdentities.find(
          (existingIdentity) => existingIdentity.identityHash === newIdentity.identityHash
            && existingIdentity.requested.account.id === newIdentity.requested.account.id,
        )
      ) {
        console.log('using existing identity');
        return;
      }

      if (!currentIdentities || !currentIdentities.length) {
        set({ identities: [newIdentity] });
      } else {
        currentIdentities = [...currentIdentities, newIdentity];
        set({ identities: currentIdentities });
      }
    },
    removeIdentity: (accountID) => {
      if (!accountID) {
        return;
      }
      let currentIdentities = get().identities;
      let newIdentities = currentIdentities.filter(x => x.requested.account.id != accountID);
      set({identities: newIdentities});
    }
  }),
  {
    name: 'beetIdentities',
  })
);

/**
 * Global app settings
 */
const appStore = create(
  persist(
    (set, get) => ({
    environment: null,
    nodes: {
      bitshares: config.bitshares.nodeList.map((node) => node.url),
      bitshares_testnet: config.bitshares_testnet.nodeList.map((node) => node.url),
    },
    setEnvironment: (env) => set({environment: env}),
    replaceNodes: (env, nodes) => {
      if (env === 'bitshares') {
        set(async (state) => ({
          nodes: { ...state.nodes, bitshares: nodes },
        }));
      } else if (env === 'bitshares_testnet') {
        set(async (state) => ({
          nodes: { ...state.nodes, bitshares_testnet: nodes },
        }));
      }
    },
    changeURL: () => {
      /**
       * The current node url isn't healthy anymore
       * shift it to the back of the queue
       * Replaces nodeFailureCallback
       */
      console.log('Changing primary node');
      const env = get().environment;
      const nodesToChange = get().nodes[env];
      nodesToChange.push(nodesToChange.shift()); // Moving misbehaving node to end

      if (env === 'bitshares') {
        set(async (state) => ({
          nodes: { ...state.nodes, bitshares: nodesToChange },
        }));
      } else if (env === 'bitshares_testnet') {
        set(async (state) => ({
          nodes: { ...state.nodes, bitshares_testnet: nodesToChange },
        }));
      } else if (env === 'tusc') {
        set(async (state) => ({
          nodes: { ...state.nodes, tusc: nodesToChange },
        }));
      }
    },
    removeURL: (env, url) => {
      let nodesToChange = get().nodes[env];
      nodesToChange = nodesToChange.filter((x) => x !== url);

      if (env === 'bitshares') {
        set((state) => ({
          nodes: { ...state.nodes, bitshares: nodesToChange },
        }));
      } else if (env === 'bitshares_testnet') {
        set((state) => ({
          nodes: { ...state.nodes, bitshares_testnet: nodesToChange },
        }));
      } else if (env === 'tusc') {
        set((state) => ({
          nodes: { ...state.nodes, tusc: nodesToChange },
        }));
      }
    },
    reset: () => set({
      environment: null,
      nodes: {
        bitshares: config.bitshares.nodeList.map((node) => node.url),
        bitshares_testnet: config.bitshares_testnet.nodeList.map((node) => node.url),
      },
    })
  }),
  {
    name: 'nodeStorage',
  },
));

/**
 * Temporary store
 */
const tempStore = create(
  (set, get) => ({
    account: "",
    accountType: null,
    asset: null,
    assets: null,
    asset_images: null,
    asset_issuer: null,
    asset_quantity: null,
    asset_order_book: null,
    setAccount: (newAccount) => set({ account: newAccount }),
    setAccountType: (type) => set({ accountType: type }),
    setInitialValues: (initialValues) => set({ initialValues }),
    setAssetImages: (images) => set({ asset_images: images }),
    setAsset: async (newAsset) => {
      /**
       * Store an asset & fetch relevant info
       * @param {Object} newAsset
       */
      const { environment, nodes, changeURL } = appStore.getState();
      const node = nodes[environment][0];
      let dynamicData;
      try {
        dynamicData = await window.electron.fetchDynamicData(node, newAsset, changeURL);
      } catch (error) {
        console.log(error);
        return;
      }

      const description = newAsset
                          && newAsset.options.description
                          && newAsset.options.description.length
        ? JSON.parse(newAsset.options.description)
        : undefined;
      const nft_object = description ? description.nft_object : undefined;

      let images;
      try {
        images = await getImages(nft_object);
      } catch (error) {
        console.log(error);
      }
      
      set({
        asset: newAsset,
        asset_images: images ?? [],
        asset_issuer: dynamicData.issuer,
        asset_quantity: dynamicData.quantity,
        asset_order_book: dynamicData.order_book,
      });
    },
    fetchAssets: async (asset_ids) => {
      /**
       * Looking asset data from an array of IDs
       * @param {Array} asset_ids
       */
      const { environment, nodes, changeURL } = appStore.getState();
      const { bitshares, bitshares_testnet, changeAssets } = assetStore.getState();
      if (!nodes || !environment) {
        return;
      }

      let cachedAssets = [];
      if (environment === 'bitshares' && bitshares && bitshares.length) {
        cachedAssets = bitshares.filter((asset) => (asset_ids.includes(asset.id) || asset_ids.includes(asset.symbol)));
      } else if (environment === 'bitshares_testnet' && bitshares_testnet && bitshares_testnet.length) {
        cachedAssets = bitshares_testnet.filter((asset) => (asset_ids.includes(asset.id) || asset_ids.includes(asset.symbol)));
      }

      const remainingAssetIds = asset_ids.filter((id) => !cachedAssets.find((asset) => asset.id === id));

      if (remainingAssetIds.length) {
        const node = nodes[environment][0];
        let response;
        try {
          response = await window.electron.fetchAssets(node, remainingAssetIds);
        } catch (error) {
          console.log(error);
          changeURL();
          return;
        }

        cachedAssets = cachedAssets.concat(response);
      }

      cachedAssets = cachedAssets.filter((asset, index, self) => index === self.findIndex((t) => (t.id === asset.id)));

      console.log("Fetched assets");
      set({ assets: cachedAssets });
      changeAssets(environment, cachedAssets);
    },
    fetchIssuedAssets: async (accountID) => {
      /**
       * Fetching the assets issued by the provided account ID
       * @param {String} accountID
       */
      const { environment, nodes, changeURL } = appStore.getState();
      const { bitshares: assetBitshares, bitshares_testnet: assetBitsharesTestnet } = assetStore.getState();
      const { bitshares: nonNFTBitshares, bitshares_testnet: nonNFTBitsharesTestnet } = nonNFTStore.getState();
      if (!nodes || !environment) {
        console.log("No nodes or environment");
        return;
      }

      let cachedAssets = [];
      let nonNFTs = [];
      if (environment === 'bitshares') {
        cachedAssets = assetBitshares && assetBitshares.length ? assetBitshares : [];
        nonNFTs = nonNFTBitshares && nonNFTBitshares.length ? nonNFTBitshares : [];
      } else if (environment === 'bitshares_testnet' && bitshares_testnet && bitshares_testnet.length) {
        cachedAssets = assetBitsharesTestnet && assetBitsharesTestnet.length ? assetBitsharesTestnet : [];
        nonNFTs = nonNFTBitsharesTestnet && nonNFTBitsharesTestnet.length ? nonNFTBitsharesTestnet : [];
      }

      const node = nodes[environment][0];
      let response;
      try {
        response = await window.electron.fetchIssuedAssets(node, accountID, cachedAssets, nonNFTs);
      } catch (error) {
        console.log(error);
        changeURL();
      }

      if (!response) {
        set({ assets: [] });
        return;
      }

      const {
        finalAssets,
        nonNFTAssetIDs,
      } = response;

      const changeAssets = assetStore.getState().changeAssets;
      const nonCachedAssets = finalAssets.filter((finalAsset) => cachedAssets.find((cachedAsset) => cachedAsset.id === finalAsset.id));
      if (nonCachedAssets.length) {
          // FinalAssets has new data to cache
          cachedAssets = cachedAssets
                          .concat(nonCachedAssets)
                          .filter((asset, index, self) => index === self.findIndex((t) => (t.id === asset.id)));

          changeAssets(environment, cachedAssets); // caching the NFT assets
      }

      const changeNonNFTs = nonNFTStore.getState().changeNonNFTs;
      changeNonNFTs(environment, nonNFTAssetIDs); // caching the non-NFT asset IDs

      if (finalAssets) {
        set({ assets: await finalAssets.filter((asset, index, self) => index === self.findIndex((t) => (t.id === asset.id))) })
      }
    },
    fetchNFTBalances: async (accountID) => {
      const { environment, nodes } = appStore.getState();
      const { bitshares: assetBitshares, bitshares_testnet: assetBitsharesTestnet } = assetStore.getState();
      const { bitshares: nonNFTBitshares, bitshares_testnet: nonNFTBitsharesTestnet } = nonNFTStore.getState();
      if (!nodes || !environment) {
        return;
      }

      let cachedAssets = [];
      let nonNFTs = [];
      if (environment === 'bitshares') {
        cachedAssets = assetBitshares && assetBitshares.length
          ? assetBitshares
          : [];
        nonNFTs = nonNFTBitshares && nonNFTBitshares.length
          ? nonNFTBitshares
          : [];
      } else if (environment === 'bitshares_testnet' && bitshares_testnet && bitshares_testnet.length) {
        cachedAssets = assetBitsharesTestnet && assetBitsharesTestnet.length
          ? assetBitsharesTestnet
          : [];
        nonNFTs = nonNFTBitsharesTestnet && nonNFTBitsharesTestnet.length
          ? nonNFTBitsharesTestnet
          : [];
      }
      
      const node = nodes[environment][0];

      let response;
      try {
        response = await window.electron.fetchUserNFTBalances(node, accountID, cachedAssets, nonNFTs);
      } catch (error) {
        console.log(error)
        return;
      }

      const {
        finalAssets,
        nonNFTAssetIDs,
      } = response;

      const changeAssets = assetStore.getState().changeAssets;
      const nonCachedAssets = finalAssets && finalAssets.length
        ? finalAssets.filter((finalAsset) => cachedAssets.find((cachedAsset) => cachedAsset.id === finalAsset.id))
        : [];

      if (nonCachedAssets.length) {
          // FinalAssets has new data to cache
          changeAssets(
            environment,
            cachedAssets
              .concat(nonCachedAssets)
              .filter((asset, index, self) => index === self.findIndex((t) => (t.id === asset.id)))
          ); // caching the NFT assets
      }

      const changeNonNFTs = nonNFTStore.getState().changeNonNFTs;
      if (nonNFTAssetIDs && nonNFTAssetIDs.length) {
        changeNonNFTs(environment, nonNFTAssetIDs); // caching the non-NFT asset IDs
      }

      if (finalAssets) {
        set({ assets: await finalAssets.filter((asset, index, self) => index === self.findIndex((t) => (t.id === asset.id))) })
      } else {
        set({ assets: [] })
      }
    },
    eraseAsset: () => set({
      asset: null,
      asset_images: null,
      asset_issuer: null,
      asset_quantity: null,
      asset_order_book: null,
    }),
    clearAssets: () => set({
      assets: null,
      nonNFTs: null,
    }),
    reset: () => set({
      account: "",
      asset: null,
      assets: null,
      asset_images: null,
      asset_issuer: null,
      asset_quantity: null,
      asset_order_book: null,
    }),
  }),
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
        beetOnline = await window.electron.checkBeet(true);
      } catch (error) {
        console.log(error);
      }
  
      if (!beetOnline) {
        console.log('beet not online')
        return;
      }
  
      let connected;
      try {
        connected = await window.electron.connect(
          "NFT Viewer",
          "Application",
          "localhost",
          null,
          identity ?? null
        );
      } catch (error) {
        console.error(error)
      }

      connected = JSON.parse(connected);
      
      if (!connected) {
        console.error("Couldn't connect to Beet");
        set({
          connection: null,
          authenticated: null,
          isLinked: null
        })
        return;
      }

      if (identity && identity.identityhash) {
        const { storedConnections } = identitiesStore.getState();
  
        const storedConnection = storedConnections[identity.identityhash];
        if (storedConnection) {
          connected.beetkey = storedConnection.beetkey;
          connected.next_identification = storedConnection.next_identification;
          connected.secret = storedConnection.secret;
          connected.id = storedConnection.next_identification;
          console.log('updated connected');
  
          set({
            connection: connected,
            authenticated: true,
            isLinked: true,
          });
          return;
        }
      }

      set({
        connection: connected,
        authenticated: connected.authenticated,
        isLinked: false
      });
    },
    link: async (environment) => {
      /**
       * Re/Link to Beet wallet
       * @param {String} environment
       */
      let linkAttempt;
      try {
        linkAttempt = await window.electron.link(
          environment === 'bitshares' ? 'BTS' : 'BTS_TEST'
        );
      } catch (error) {
        console.error(error)
        set({ isLinked: null, identity: null })
        return;
      }

      if (!linkAttempt) {
        set({ isLinked: null, identity: null })
        return;
      }

      const parsedLinkAttempt = JSON.parse(linkAttempt);

      if (!parsedLinkAttempt || !parsedLinkAttempt.identity) {
        console.log('No identity in linkAttempt');
        set({ isLinked: null, identity: null })
        return;
      }

      const { storeConnection } = identitiesStore.getState();

      try {
        storeConnection(parsedLinkAttempt);
      } catch (error) {
        console.log(error);
      }
      
      const { setAccount } = tempStore.getState();
      try {
        setAccount(parsedLinkAttempt.identity.requested.account.id);
      } catch (error) {
        console.log(error);
      }

      set({ isLinked: true, identity: parsedLinkAttempt.identity })
    },
    relink: async (environment) => {
      /**
       * Relink to Beet wallet
       * @param {String} environment
       */
      const currentConnection = get().connection;
  
      let linkAttempt;
      try {
        linkAttempt = await window.electron.link(
          environment === 'bitshares' ? 'BTS' : 'BTS_TEST',
          currentConnection,
        );
      } catch (error) {
        console.error(error);
        return;
      }
  
      set({ connection: currentConnection, isLinked: true });
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
  nonNFTStore,
  assetStore,
  beetStore,
  identitiesStore,
  localePreferenceStore,
  favouritesStore,
  tempStore,
};
