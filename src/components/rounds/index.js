import { Flex, Box, Text, Stack } from "@chakra-ui/react";
import React from "react";
import { useWeb3React } from "@web3-react/core";
import cryptoPricePrediction from "../../contracts/CryproPairPricePredictionFactory.json";
import { getContractInstance } from "../../helper/contract-methods";
import {
  RINKEBY_CONTRACT_ADDRESS,
  pairTypes,
  siteColorCodes,
} from "../../helper/constant";
import { useRounds } from "../../hooks/use-rounds";
import { usePriceFeeds } from "../../hooks/use-price-feeds";
import { CountDownTimer } from "./countdown";
import { Progress } from "@chakra-ui/react";
import { ButtonWrapper } from "./bet-buttons-wrapper";
import { ethers } from "ethers";
import { useGetUsers } from "../../hooks/use-get-users";
import SwiperCore, { Keyboard, Mousewheel, FreeMode } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import styled from "styled-components";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import UserDrawerBoard from "./user-drawer-board";

SwiperCore.use([Keyboard, Mousewheel, FreeMode]);

const StyledSwiper = styled.div`
  .swiper-wrapper {
    align-items: center;
    display: flex;
  }

  .swiper-slide {
    width: 400px;
  }
`;

const convertPriceUptoTwoDecimal = (price) => {
  return (price / 100000000).toFixed(2);
};

const percentageCalculation = (fixedPrice, updatedPrice) => {
  if (!updatedPrice) return 0;
  if (updatedPrice > fixedPrice) {
    return ((updatedPrice - fixedPrice) / updatedPrice) * 100;
  } else {
    return ((fixedPrice - updatedPrice) / updatedPrice) * 100;
  }
};

const tokenPercentageChangeCalculation = (
  firstTokenPrice,
  secondTokenPrice,
  updatedPriceFeeds
) => {
  if (!updatedPriceFeeds?.length) return;
  const firstTokenPercentageChange = percentageCalculation(
    convertPriceUptoTwoDecimal(firstTokenPrice),
    updatedPriceFeeds?.[0]
  );
  const secondTokenPercentageChange = percentageCalculation(
    convertPriceUptoTwoDecimal(secondTokenPrice),
    updatedPriceFeeds?.[1]
  );

  const ratioOfPercentageChanges =
    (firstTokenPercentageChange /
      (firstTokenPercentageChange + secondTokenPercentageChange)) *
    100;
  const payoutRatio = [
    (firstTokenPercentageChange / secondTokenPercentageChange).toFixed(1),
    (secondTokenPercentageChange / firstTokenPercentageChange).toFixed(1),
  ];
  return {
    firstTokenPercentageChange,
    secondTokenPercentageChange,
    ratioOfPercentageChanges,
    payoutRatio,
  };
};

const TokenWrapper = ({
  path,
  tokenRoundFixedPrice,
  pair,
  color,
  payoutRatio,
  showLiveRoundLoader,
}) => {
  const payoutRatioWithoutInfinty = payoutRatio === Infinity ? 0 : payoutRatio;
  return (
    <Flex marginX="3" flexDir="column">
      <img src={path} height="70px" width="70px" />
      <Text color={color} mt="2" fontSize="sm" fontWeight="bold">
        {pair}
      </Text>
      <Text mt="2" fontWeight="bold">
        {convertPriceUptoTwoDecimal(tokenRoundFixedPrice)}
      </Text>
      {payoutRatio && !showLiveRoundLoader && (
        <Text mt="1" fontWeight="bold">
          {payoutRatioWithoutInfinty}x
        </Text>
      )}
    </Flex>
  );
};

const ExpiredRound = () => {
  return (
    <Box
      position="absolute"
      bg={siteColorCodes?.roundCardBackground}
      top="0px"
      w="100%"
      h="100%"
      zIndex="2"
      opacity="0.5"
      _hover={{
        background: "none",
      }}
    />
  );
};

const RoundInfoWrapper = ({
  endTimeStamp,
  poolAmount,
  winner,
  roundEnded,
  isLastRound,
}) => {
  return (
    <Stack>
      {!isLastRound && <CountDownTimer time={Number(endTimeStamp) * 1000} />}
      <Text text-align="center" fontWeight="bold">
        Pool : {poolAmount > 0 ? Number(poolAmount)?.toFixed(4) : 0}
      </Text>
      {roundEnded && Number(endTimeStamp) !== 0 && (
        <Text text-align="center" color="teal.400" fontWeight="bold">
          {winner()} WINS
        </Text>
      )}
    </Stack>
  );
};

const calculateTimeBasedProgress = (endTimeStamp, startTimeStamp) => {
  const startMs = startTimeStamp * 1000;
  const endMs = endTimeStamp * 1000;
  const diff = (endMs - startMs) / 2;
  const now = Date.now();
  const rawProgress =
    ((now - (startMs + diff)) / (endMs - (startMs + diff))) * 100;
  const progress = rawProgress <= 100 ? rawProgress : 100;
  return progress;
};

const isliveRoundCompleted = (endTimeStamp) => {
  const endMs = endTimeStamp;
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime > endMs;
};

const RoundHeader = ({
  roundNumber,
  roundStatus,
  endTimeStamp,
  startTimeStamp,
  isRoundLive,
}) => {
  const timeProgressRatio = calculateTimeBasedProgress(
    endTimeStamp,
    startTimeStamp
  );

  return (
    <Box mb="4">
      <Flex p="4" justifyContent="space-between" alignItems="center">
        <Flex flex="1">
          <Text fontWeight="bold" fontSize="16">
            {roundStatus}
          </Text>
        </Flex>
        <Flex flex="1" justifyContent="center">
          <Text fontWeight="bold" fontSize="16">
            BTC VS ETH
          </Text>
        </Flex>
        <Flex flex="1" justifyContent="flex-end">
          <Text mr="1px" fontSize="12px">
            #{roundNumber}
          </Text>
        </Flex>
      </Flex>
      {isRoundLive ? (
        <Progress
          sx={{
            div: {
              float: "left",
            },
          }}
          colorScheme="yellow"
          value={timeProgressRatio}
        />
      ) : (
        <Box h="12px" bg="gray.600" />
      )}
    </Box>
  );
};

const RoundProgressWrapper = ({ progress }) => {
  const dominancePercentage = progress?.ratioOfPercentageChanges ?? 50;
  return (
    <Box marginX="1" mb="2">
      <Text fontWeight="bold" textAlign="center">
        Dominance
      </Text>
      <Progress
        colorScheme={"orange"}
        hasStripe
        size="lg"
        sx={{
          backgroundSize: "1rem 1rem",
          backgroundColor: "#ecc94b !important",
          backgroundImage:
            "linear-gradient( 45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent )",
          div: {
            backgroundColor: "#dd6b20 !important",
            float: "left",
          },
        }}
        value={dominancePercentage}
      />
      <Flex justifyContent="space-between">
        <Text fontWeight="bold">{dominancePercentage.toFixed(0)}%</Text>
        <Text fontWeight="bold">
          {(100 - dominancePercentage).toFixed(0)}%{" "}
        </Text>
      </Flex>
    </Box>
  );
};

const LiveRoundCalculationLoader = () => {
  return (
    <Flex flexDir="column" justifyContent="center" alignItems="center">
      <img src={"./loader.gif"} height="70px" width="70px" />
      <Text mt="5" fontWeight="bold">
        Calculating...
      </Text>
    </Flex>
  );
};

export const RoundContext = React.createContext("light");

export const Round = ({ pair }) => {
  const { library } = useWeb3React();
  const signer = library?.getSigner();

  const cryptoPredictionContract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    signer
  );

  const roundWinner = (round) => {
    const winner =
      round.firstTokenPriceChange === round.secondTokenPriceChange
        ? 0
        : round.firstTokenPriceChange > round.secondTokenPriceChange
        ? 1
        : 2;

    return winner === 0 ? "" : pairTypes[pair][winner];
  };

  const [rounds, allRounds] = useRounds(
    cryptoPredictionContract,
    signer,
    pair,
    200
  );

  const users = useGetUsers(cryptoPredictionContract, signer, rounds, pair);

  const currentPairsPriceFeeds = usePriceFeeds([
    pairTypes[pair]?.tokenAddress1,
    pairTypes[pair]?.tokenAddress2,
  ]);

  const pairInfo = pairTypes[pair];

  if (!rounds?.length) return null;

  return (
    <RoundContext.Provider value={[pair, rounds]}>
      <Box position="relative">
        <StyledSwiper>
          <Swiper
            initialSlide={rounds?.length - 2}
            spaceBetween={16}
            slidesPerView="auto"
            freeMode={{
              enabled: true,
              sticky: true,
              momentumRatio: 0.25,
              momentumVelocityRatio: 0.5,
            }}
            centeredSlides
            mousewheel
            keyboard
            resizeObserver
          >
            {rounds?.map((round, index) => {
              if (round?.roundNumber == 0) return null;
              const {
                roundLock,
                roundNumber,
                roundEnded,
                startTimeStamp,
                endTimeStamp,
                secondTokenPrice,
                firstTokenPrice,
                poolAmount,
              } = round;
              const roundStatus = roundEnded
                ? "EXPIRED"
                : roundLock
                ? "LIVE"
                : "NEXT";
              const isRoundLive = roundLock && !roundEnded;
              const isLastRound = !roundLock && !roundEnded;
              const percentageRationCalulation =
                isRoundLive &&
                tokenPercentageChangeCalculation(
                  firstTokenPrice,
                  secondTokenPrice,
                  currentPairsPriceFeeds
                );

              const currentRoundUser = users?.[roundNumber];
              const isCurrentUserClaimDone = currentRoundUser
                ? !(currentRoundUser?.isWinner && !currentRoundUser?.claim)
                : roundEnded;
              const isExpired =
                !isRoundLive && !isLastRound && isCurrentUserClaimDone;
              const showLiveRoundLoader =
                isRoundLive && isliveRoundCompleted(endTimeStamp);

              const roundPayoutRation =
                percentageRationCalulation &&
                percentageRationCalulation?.payoutRatio;

              return (
                <SwiperSlide key={roundNumber}>
                  {({ isActive }) => (
                    <Box
                      m="2"
                      borderWidth="1px"
                      backgroundClip={"content-box, border-box"}
                      backgroundSize="cover"
                      boxSizing="border-box"
                      borderRadius="5px"
                      boxShadow="0 0 3px 5px rgba(0, 0, 0, 0.5)"
                      border="2px solid transparent"
                      background={
                        !roundEnded
                          ? "linear-gradient(90deg, rgba(236,201,75,1) 0%, rgba(221,107,32,1) 100%)"
                          : "none"
                      }
                      position="relative"
                    >
                      <Box
                        h="320px"
                        background={siteColorCodes?.roundCardBackground}
                      >
                        <RoundHeader
                          roundNumber={roundNumber}
                          roundStatus={roundStatus}
                          endTimeStamp={endTimeStamp}
                          startTimeStamp={startTimeStamp}
                          isRoundLive={isRoundLive}
                        />
                        <Flex
                          mb="2"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <TokenWrapper
                            path={pairInfo.tokenImage1}
                            pair={pairInfo[1]}
                            color={siteColorCodes.firstTokenColor}
                            tokenRoundFixedPrice={firstTokenPrice}
                            showLiveRoundLoader={showLiveRoundLoader}
                            payoutRatio={roundPayoutRation?.[0]}
                          />
                          {!showLiveRoundLoader && (
                            <RoundInfoWrapper
                              endTimeStamp={endTimeStamp}
                              poolAmount={ethers.utils.formatEther(poolAmount)}
                              winner={() => roundWinner(round)}
                              roundEnded={roundEnded}
                              isLastRound={isLastRound}
                            />
                          )}
                          {showLiveRoundLoader && (
                            <LiveRoundCalculationLoader />
                          )}
                          <TokenWrapper
                            path={pairInfo.tokenImage2}
                            pair={pairInfo[2]}
                            color={siteColorCodes.secondTokenColor}
                            tokenRoundFixedPrice={secondTokenPrice}
                            showLiveRoundLoader={showLiveRoundLoader}
                            payoutRatio={roundPayoutRation?.[1]}
                          />
                        </Flex>
                        {isRoundLive && !showLiveRoundLoader && (
                          <RoundProgressWrapper
                            progress={percentageRationCalulation}
                          />
                        )}
                        <ButtonWrapper
                          round={round}
                          pair={pair}
                          users={users}
                          pairRound={roundNumber}
                          allRounds={rounds}
                        />
                      </Box>
                      {isExpired && <ExpiredRound />}
                    </Box>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </StyledSwiper>
        {rounds?.length > 0 && (
          <UserDrawerBoard
            contract={cryptoPredictionContract}
            signer={signer}
            pair={pair}
            rounds={allRounds}
          />
        )}
      </Box>
    </RoundContext.Provider>
  );
};
