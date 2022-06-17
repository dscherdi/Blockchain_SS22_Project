  #!/usr/bin/env bash

 # imports
 . network/scripts/envVar.sh

  packageChaincode() {
  set -x
  if [ ! -d "${PWD}/chaincode/package/" ]; then
    mkdir chaincode/package  
  fi
  peer lifecycle chaincode package chaincode/package/${CC_NAME}_${CC_VERSION}.tar.gz --path ${CC_SRC_PATH} --lang node --label ${CC_NAME}_${CC_VERSION} > network/scripts/logs/packageChaincode.log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat network/scripts/logs/packageChaincode.log.txt
}

installChaincode() {
  ORG=$1
  setGlobals $ORG
  set -x
  peer lifecycle chaincode install chaincode/package/${CC_NAME}_${CC_VERSION}.tar.gz > network/scripts/logs/installChaincode.$ORG.log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat network/scripts/logs/installChaincode.$ORG.log.txt
}

queryInstalled() {
  ORG=$1
  setGlobals $ORG
  set -x
  peer lifecycle chaincode queryinstalled > network/scripts/logs/queryInstalled.log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat network/scripts/logs/queryInstalled.log.txt
  PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" network/scripts/logs/queryInstalled.log.txt)
}

approveForMyOrg() {
  ORG=$1
  setGlobals $ORG
  set -x
  peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE} > network/scripts/logs/approveForMyOrg.$ORG.log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat network/scripts/logs/approveForMyOrg.$ORG.log.txt
}

checkCommitReadiness() {
  ORG=$1
  shift 1
  setGlobals $ORG
  echo "Checking the commit readiness of the chaincode definition on peer0.org${ORG} on channel '$CHANNEL_NAME'..."
  local rc=1
  local COUNTER=1
  while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
    sleep $DELAY
    echo "Attempting to check the commit readiness of the chaincode definition on peer0.org${ORG}, Retry after $DELAY seconds."
    set -x
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --sequence ${CC_SEQUENCE} --output json > network/scripts/logs/checkCommitReadiness.$ORG.log.txt
    res=$?
    { set +x; } 2>/dev/null
    let rc=0
    for var in "$@"; do
      grep "$var" network/scripts/logs/checkCommitReadiness.$ORG.log.txt &>/dev/null || let rc=1
    done
    COUNTER=$(expr $COUNTER + 1)
  done
  cat network/scripts/logs/checkCommitReadiness.$ORG.log.txt
  if test $rc -eq 0; then
    echo "Checking the commit readiness of the chaincode definition successful on peer0.org${ORG} on channel '$CHANNEL_NAME'"
  else
    echo "After $MAX_RETRY attempts, Check commit readiness result on peer0.org${ORG} is INVALID!"
  fi
}

commitChaincodeDefinition() {
  parsePeerConnectionParameters $@
  res=$?
  set -x
  peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} "${PEER_CONN_PARMS[@]}" --version ${CC_VERSION} --sequence ${CC_SEQUENCE} > network/scripts/logs/commitChaincodeDefinition.log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat  network/scripts/logs/commitChaincodeDefinition.log.txt
}

# queryCommitted ORG
queryCommitted() {
  ORG=$1
  setGlobals $ORG
  EXPECTED_RESULT="Version: ${CC_VERSION}, Sequence: ${CC_SEQUENCE}, Endorsement Plugin: escc, Validation Plugin: vscc"
  echo "Querying chaincode definition on peer0.org${ORG} on channel '$CHANNEL_NAME'..."
  local rc=1
  local COUNTER=1
  peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME} > network/scripts/logs/querycommitted.$ORG.log.txt
  res=$?
  { set +x; } 2>/dev/null
  cat network/scripts/logs/querycommitted.$ORG.log.txt
}

echo "Compiling TypeScript code into JavaScript..."
pushd chaincode
npm install
npm run build
popd
echo "Finished compiling TypeScript code into JavaScript"

packageChaincode
echo "Installing chaincode on peer0.org1..."
installChaincode 1
echo "Install chaincode on peer0.org2..."
installChaincode 2
queryInstalled 1
echo "Approve chaincode on peer0.org1..."
approveForMyOrg 1
checkCommitReadiness 1 "\"Org1MSP\": true" "\"Org2MSP\": false"
checkCommitReadiness 2 "\"Org1MSP\": true" "\"Org2MSP\": false"
echo "Installing chaincode on peer0.org2..."
approveForMyOrg 2
checkCommitReadiness 1 "\"Org1MSP\": true" "\"Org2MSP\": true"
checkCommitReadiness 2 "\"Org1MSP\": true" "\"Org2MSP\": true"
echo "Commit chaincode to the Channel ${CHANNEL_NAME}"
commitChaincodeDefinition 1 2
queryCommitted 1
queryCommitted 2