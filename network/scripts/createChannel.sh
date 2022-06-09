#!/bin/bash

# imports
. network/scripts/envVar.sh

########## CHANNEL CREATION

function createChannelGenesisBlock() {
	which configtxgen
	if [ "$?" -ne 0 ]; then
		echo "configtxgen tool not found."
	fi
    
  echo "Generating channel genesis block '${CHANNEL_NAME}.block'"
	set -x
	configtxgen -profile TwoOrgsApplicationGenesis -outputBlock ./network/artifacts/${CHANNEL_NAME}.block -channelID $CHANNEL_NAME
	res=$?
	{ set +x; } 2>/dev/null
}

function createChannel() {
	# Poll in case the raft leader is not set yet
	local rc=1
	local COUNTER=1
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
		sleep $DELAY
		set -x
		osnadmin channel join --channelID $CHANNEL_NAME --config-block ./network/artifacts/${CHANNEL_NAME}.block -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" > network/scripts/logs/createChannel.log.txt
		res=$?
		{ set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
  cat network/scripts/logs/createChannel.log.txt
}

function joinChannel() {
  ORG=$1
  setGlobals $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
    peer channel join -b ./network/artifacts/${CHANNEL_NAME}.block > network/scripts/logs/joinChannel.log.txt 
    res=$?
    { set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat network/scripts/logs/joinChannel.log.txt 
}

setAnchorPeer() {
  ORG=$1
  docker exec cli ./scripts/setAnchorPeer.sh $ORG $CHANNEL_NAME 
}

createChannelGenesisBlock
createChannel
joinChannel 1
joinChannel 2
setAnchorPeer 1
setAnchorPeer 2