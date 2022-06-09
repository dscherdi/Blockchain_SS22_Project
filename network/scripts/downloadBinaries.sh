#!/bin/bash

download() {
    local BINARY_FILE=$1
    local URL=$2
    echo "===> Downloading: " "${URL}"
    curl -L --retry 5 --retry-delay 3 "${URL}" | tar xz || rc=$?
    if [ -n "$rc" ]; then
        echo "==> There was an error downloading the binary file."
        return 22
    else
        echo "==> Done."
    fi
}

function preReq() {
    echo "Pull Hyperledger Fabric binaries for HLFv${BIN_VERSION}"
    echo "===> Downloading version ${FABRIC_TAG} platform specific fabric binaries"
    download "${BINARY_FILE}" "https://github.com/hyperledger/fabric/releases/download/v${BIN_VERSION}/${BINARY_FILE}"
    if [ $? -eq 22 ]; then
        echo "${FABRIC_TAG} platform specific fabric binary is not available to download"
        exit
    fi

    echo "===> Downloading version ${CA_TAG} platform specific fabric-ca-client binary"
    download "${CA_BINARY_FILE}" "https://github.com/hyperledger/fabric-ca/releases/download/v${CA_VERSION}/${CA_BINARY_FILE}"
    if [ $? -eq 22 ]; then
        echo "${CA_TAG} fabric-ca-client binary is not available to download"
        exit
    fi 

    rm -Rf config
    mv ./bin ./network/bin/
}

BIN_VERSION=2.3.2
CA_VERSION=1.5.0
ARCH=$(echo "$(uname -s|tr '[:upper:]' '[:lower:]'|sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')")
BINARY_FILE=hyperledger-fabric-${ARCH}-${BIN_VERSION}.tar.gz
CA_BINARY_FILE=hyperledger-fabric-ca-${ARCH}-${CA_VERSION}.tar.gz

preReq