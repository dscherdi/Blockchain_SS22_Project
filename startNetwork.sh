#!/usr/bin/env bash
export PATH=${PWD}/network/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/network/configuration
export VERBOSE=true

# imports
. network/scripts/envVar.sh
. network/scripts/registerEnroll.sh

function clearContainers() {
  echo "Removing remaining containers"
  docker rm -f $(docker ps -aq --filter label=service=hyperledger-fabric) 2>/dev/null || true
  docker rm -f $(docker ps -aq --filter name='dev-peer*') 2>/dev/null || true
}

function removeUnwantedImages() {
  echo "Removing generated chaincode docker images"
  docker image rm -f $(docker images -aq --filter reference='dev-peer*') 2>/dev/null || true
}

function removeGeneratedMaterials {
    echo "Removing generated material"
    rm -Rf network/certificates/*
    rm -Rf network/artifacts/*
    rm -Rf network/scripts/logs/*
    rm -Rf blockchain-service/wallet
}

function createOrgs() {
  if [ -d "network/certificates" ]; then
    rm -Rf network/certificates/
  fi

  echo "Generating certificates using Fabric CA"
  docker-compose -f $COMPOSE_FILE_CA up -d 2>&1


  while :
    do
      if [ ! -f "network/certificates/fabric-ca/org1/tls-cert.pem" ]; then
        echo "fabric-ca is starting"
        sleep 1
      else
        break
      fi
    done

    echo "Creating Org1 Identities"

    createOrg1

    echo "Creating Org2 Identities"

    createOrg2

    echo "Creating Orderer Org Identities"

    createOrderer

  echo "Generating CCP files for Org1 and Org2"
  ./network/scripts/ccp-generate.sh

  mkdir ./blockchain-service/connection-profile
  cp ./network/certificates/peerOrganizations/org1.example.com/connection-org1.json ./blockchain-service/connection-profile/connection-org1.json
  cp ./network/certificates/peerOrganizations/org2.example.com/connection-org2.json ./blockchain-service/connection-profile/connection-org2.json
}

function networkUp() {
  if [ ! -d "network/certificates/peerOrganizations" ]; then
    createOrgs
  fi

  docker-compose -f ${COMPOSE_FILE} up -d 2>&1

  docker ps -a
  if [ $? -ne 0 ]; then
    fatalln "Unable to start network"
  fi
}

function networkDown() {
  stopAndRemoveMiddleware
  docker-compose -f $COMPOSE_FILE down --volumes --remove-orphans
  clearContainers
  removeUnwantedImages
  removeGeneratedMaterials
}

function channelUp() {
	if [ ! -d "network/scripts/logs" ]; then
    mkdir network/scripts/logs
  fi

  sh network/scripts/createChannel.sh

  if [ $? -ne 0 ]; then
    echo "Channel configuration failed"
  fi
}

function startNetwork() {
  networkUp
  channelUp
  deployCC
  #buildAndRunMiddleware

  echo "Waiting for Network - 5 Seconds"
  sleep 5
  echo "Show running Hyperledger Fabric Soluton"
  docker ps
}

########## DEPLOY CHAINCODE

function deployCC() {
  sh network/scripts/deployCC.sh

  if [ $? -ne 0 ]; then
    echo "Deploying chaincode failed"
  fi
}

######## DEPLOY Middleware (Not used yet)

function buildAndRunMiddleware() {
  docker build -t bs:1.0 blockchain-service
  docker run --name blockchain-service --network fabric_test -p 3000:3000 -d bs:1.0 
}

function stopAndRemoveMiddleware() {
  docker stop blockchain-service
  docker rm blockchain-service
}

if [ ! -d "network/bin" ]; then
  echo "Binaries for Fabric 2.3.2 are missing! Please run this first: sh network/scripts/downloadBinaries.sh"
elif [ "${1}" == "down" ]; then
  networkDown
elif [ "${1}" == "up" ]; then
  startNetwork
elif [ "${1}" == "restart" ]; then
  networkDown
  sleep 3
  startNetwork
fi