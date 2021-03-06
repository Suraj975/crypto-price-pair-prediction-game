export const RINKEBY_CONTRACT_ADDRESS =
  process.env.REACT_APP_RINKEBY_CONTRACT_ADDRESS;

// Chainlink Price feeds address https://docs.chain.link/docs/ethereum-addresses/
export const ETH_USD_RINKEBY_ADDRESS =
  "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e";
export const BTC_USD_RINKEBY_ADDRESS =
  "0xECe365B379E1dD183B20fc5f022230C044d51404";

export const ETH_USD_MATIC_MAINNET_ADDRESS =
  "0xF9680D99D6C9589e2a93a78A04A279e509205945";
export const BTC_USD_MATIC_MAINNET_ADDRESS =
  "0xc907E116054Ad103354f2D350FD2514433D57F6f";

export const MATIC_USD_MATIC_MAINNET_ADDRESS =
  "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
export const LINK_USD_MATIC_MAINNET_ADDRESS =
  "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665";
export const SAND_USD_MATIC_MAINNET_ADDRESS =
  "0x3D49406EDd4D52Fb7FFd25485f32E073b529C924";

export const pairTypes = {
  1: {
    1: "BTC-USD",
    2: "ETH-USD",
    tokenImage1: "./btc.svg",
    tokenImage2: "./eth.svg",
    comaparison: "BTC Vs ETH",
    tokenSymbol1: "BTC",
    tokenSymbol2: "ETH",
    tokenAddress1: BTC_USD_MATIC_MAINNET_ADDRESS,
    tokenAddress2: ETH_USD_MATIC_MAINNET_ADDRESS,
  },
  2: {
    1: "MATIC-USD",
    2: "SAND-USD",
    tokenImage1: "./matic.svg",
    tokenImage2: "./sand.svg",
    comaparison: "MATIC Vs SAND",
    tokenSymbol1: "MATIC",
    tokenSymbol2: "SAND",
    tokenAddress1: MATIC_USD_MATIC_MAINNET_ADDRESS,
    tokenAddress2: SAND_USD_MATIC_MAINNET_ADDRESS,
  },
};

export const siteColorCodes = {
  bodyBackround: "#14213d",
  navBarBackground: "#14213d",
  roundCardBackground: "#000000",
  modalBAcground: "black",
  firstTokenColor: "orange.500",
  secondTokenColor: "yellow.500",
};
