module.exports = {
    contractAddr: "0x38bfa705c10314Cb80910E059de5898458F879b3",
    contractABI: [
        {
            constant: false,
            inputs: [
                {
                    name: "newNumber",
                    type: "uint8"
                }
            ],
            name: "setPlugNumber",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "to",
                    type: "address"
                },
                {
                    name: "amount",
                    type: "uint256"
                }
            ],
            name: "giveEther",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [
                {
                    name: "",
                    type: "uint256"
                }
            ],
            name: "otherAdmins",
            outputs: [
                {
                    name: "",
                    type: "address"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "plugId",
                    type: "uint8"
                },
                {
                    name: "minDuration",
                    type: "uint256"
                },
                {
                    name: "maxStartTime",
                    type: "uint256"
                },
                {
                    name: "NFC",
                    type: "bytes32"
                }
            ],
            name: "bookAPlug",
            outputs: [
                {
                    name: "startTime",
                    type: "uint256"
                },
                {
                    name: "duration",
                    type: "uint256"
                }
            ],
            payable: true,
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "plugNumber",
            outputs: [
                {
                    name: "",
                    type: "uint8"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [
                {
                    name: "person",
                    type: "address"
                }
            ],
            name: "isAdmin",
            outputs: [
                {
                    name: "",
                    type: "bool"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [],
            name: "kill",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "newTime",
                    type: "uint256"
                }
            ],
            name: "setConfirmationTime",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "newAdmin",
                    type: "address"
                },
                {
                    name: "index",
                    type: "uint256"
                }
            ],
            name: "changeOtherAdmin",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "confirmationTime",
            outputs: [
                {
                    name: "",
                    type: "uint256"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "userChangeTime",
            outputs: [
                {
                    name: "",
                    type: "uint256"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "minumumBookingTime",
            outputs: [
                {
                    name: "",
                    type: "uint256"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "newTime",
                    type: "uint256"
                }
            ],
            name: "setMinimumBookingTime",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "newPrice",
                    type: "uint256"
                }
            ],
            name: "setPrice",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "newTime",
                    type: "uint256"
                }
            ],
            name: "setUserChangeTime",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "price",
            outputs: [
                {
                    name: "",
                    type: "uint256"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [
                {
                    name: "inSeconds",
                    type: "uint256"
                }
            ],
            name: "secondsToWei",
            outputs: [
                {
                    name: "inWei",
                    type: "uint256"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [
                {
                    name: "",
                    type: "uint256"
                }
            ],
            name: "endBookTime",
            outputs: [
                {
                    name: "",
                    type: "uint256"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [
                {
                    name: "inWei",
                    type: "uint256"
                }
            ],
            name: "weiToSeconds",
            outputs: [
                {
                    name: "inSeconds",
                    type: "uint256"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            constant: false,
            inputs: [
                {
                    name: "amount",
                    type: "uint256"
                }
            ],
            name: "getEther",
            outputs: [],
            payable: false,
            type: "function"
        },
        {
            constant: true,
            inputs: [],
            name: "admin",
            outputs: [
                {
                    name: "",
                    type: "address"
                }
            ],
            payable: false,
            type: "function"
        },
        {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    name: "plugId",
                    type: "uint8"
                },
                {
                    indexed: false,
                    name: "chargingTime",
                    type: "uint256"
                },
                {
                    indexed: false,
                    name: "startTime",
                    type: "uint256"
                },
                {
                    indexed: false,
                    name: "NFC",
                    type: "bytes32"
                }
            ],
            name: "BookEvent",
            type: "event"
        }
    ]
};