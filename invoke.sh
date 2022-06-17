#!/usr/bin/env bash
export PATH=${PWD}/network/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/network/configuration

# imports
. network/scripts/envVar.sh

function invoke() {
    parsePeerConnectionParameters 1
    setGlobals 1
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" -C $CHANNEL_NAME -n $CC_NAME "${PEER_CONN_PARMS[@]}" -c '{"function":"createEnpalAsset","Args":["'$1'","'$2'"]}'
}

function query() {
    setGlobals 1
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["readEnpalAsset","'$1'"]}'
}

if [ "${1}" == "invoke" ]; then
  invoke $2 $3
elif [ "${1}" == "query" ]; then
  query $2
fi