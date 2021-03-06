/*

https://galleass.io
by Austin Thomas Griffith

*/


import React, { Component } from 'react';
import Draggable from 'react-draggable';

import ReactHintFactory from 'react-hint'
import './reacthint.css'
import './App.css';
import galleassAddress from './Address.js'
import galleassBlockNumber from './blockNumber.js'
import Writing from './Writing.js'

// -- tokens --- //
import Dogger from './tokens/Dogger.js'
import Citizen from './tokens/Citizen.js'
import CitizenFace from './tokens/CitizenFace.js'

// -- modals --- //
import BuySellTable from './modal/BuySellTable.js'
import BuildTable from './modal/BuildTable.js'
import CreateCitizens from './modal/CreateCitizens.js'
import ResourceTable from './modal/ResourceTable.js'
import SendToken from './modal/SendToken.js'
import Wallet from './modal/Wallet.js'
import SendToTile from './modal/SendToTile.js'
import BuySellOwner from './modal/BuySellOwner.js'
import ForestTile from './modal/ForestTile.js'
import MountainTile from './modal/MountainTile.js'
import GrassTile from './modal/GrassTile.js'
import Harbor from './modal/Harbor.js'
import Market from './modal/Market.js'
import Fishmonger from './modal/Fishmonger.js'


import Message from './modal/renderers/Message.js'

// -- hud--- //
import Inventory from './hud/Inventory.js'
import BottomBar from './hud/BottomBar.js'
import Social from './hud/Social.js'
import Transactions from './hud/Transactions.js'
import Messages from './hud/Messages.js'
/*
assuming that galleassBlockNumber is the oldest block for all contracts
that means if you redeploy the galleass contract you have to redeploy ALL
of the other ones or rebuild this logic (maybe just always use the original)
this is used for event look back
*/
import galleassAbi from './Galleass.abi.js'
import Fish from './Fish.js'
import Land from './Land.js'
import Ships from './Ships.js'
import Clouds from './Clouds.js'
import Sea from './Sea.js'

import BurnerProvider from 'burner-provider';

import axios from 'axios'
import Blockies from 'react-blockies';
import Metamask from './Metamask.js'
import {Motion, spring, presets} from 'react-motion';
const ReactHint = ReactHintFactory(React)

const UPGRADING = false;

const RECEIPTPOLL = 1333;
//last hardcoded ipfs, from here on out we load from an Ipfs contract
let IPFSADDRESS = "Qmb5fNbSZ6zooVQjKqccEsq33nVX1RaCg9zd2Wm3qhQjrT";

var Web3 = require('web3');
let width = 4000;
let height = 1050;
let horizon = 300;
let shipSpeed = 512;
let contracts = {};
let readContracts = {};
let blocksLoaded = {};
let txWaitIntervals = [];
let web3;
let xdaiweb3;
let mainnetweb3;
let daiContract;
let ensContract;
let veryFirstLoad = true;

let loadContracts = [
  "Bay",
  "Sky",
  "Harbor",
  "Dogger",
  "Timber",
  "Stone",
  "Greens",
  "Catfish",
  "Pinner",
  "Redbass",
  "Snark",
  "Dangler",
  "Fishmonger",
  "Copper",
  "Land",
  "LandLib",
  "Experience",
  "Fillet",
  "Ipfs",
  "Village",
  "Castle",
  "Citizens",
  "CitizensLib",
  "TimberCamp",
  "Market",
  "Schooner",
  "Sea",
]

let inventoryTokens = [
  "Citizens",
  "Schooner",
  "Dogger",
  "Copper",
  "Stone",
  "Timber",
  "Greens",
  "Fillet",
  "Catfish",
  "Pinner",
  "Redbass",
  "Snark",
  "Dangler",
]

const MINGWEI = 0.1
const MAXGWEI = 51
const STARTINGGWEI = 2.0011;

const GAS = 100000;
const FISHINGBOAT = 0;
const LOADERSPEED = 250 //this * 24 should be close to a long block time
const ETHERPREC = 1000 //decimals to show on eth inv
const EVENTLOADCHUNK = 65534*2;//load a days worth of blocks of events at a time? (this should probably be more right?)
const FISHEVENTSYNCLIVEINTERVAL = 333
const SHIPSEVENTSYNCLIVEINTERVAL = 444
const CLOUDEVENTSYNCLIVEINTERVAL = 555
const ISLANDEVENTINTERVAL = 666
let eventLoadIndexes = {};
let bottomBarTimeout;


console.log("APP")
//document.domain = 'galleass.io';


let RPCENDPOINT = 'https://dai.poa.network'
if(window.location.href.indexOf("localhost")>=0){
  RPCENDPOINT = "http://localhost:8545"
}

const STARTZOOMAT = 900
/*
let textStyle = {
zIndex:210,
fontWeight:'bold',
fontSize:22,
paddingRight:10,
color:"#dddddd",
textShadow: "-1px 0 #777777, 0 1px #777777, 1px 0 #777777, 0 -1px #777777"
}*/

class App extends Component {


  async ensLookup(name){
    /*const MAINNET_CHAIN_ID = '1';

    let hash = namehash.hash(name)
    console.log("namehash",name,hash)
    let resolver = await ensContract.methods.resolver(hash).call()
    if(resolver=="0x0000000000000000000000000000000000000000") return "0x0000000000000000000000000000000000000000"
    console.log("resolver",resolver)

    const ensResolver = new ensContract(require("./contracts/ENSResolver.abi.js"),resolver)
    console.log("ensResolver:",ensResolver)
    return ensResolver.methods.addr(hash).call()
    */
  }



  constructor(props) {
    super(props);

    this.state = {
      hintMode:0,
      hintClicks:0,
      loaderOpacity:1,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      mapScale:1,
      GWEI:STARTINGGWEI,
      gweiOpacity:0.3,
      etherscan:"https://blockscout.com/poa/xdai/",
      scrollLeft:0,
      scrollConfig:{stiffness: 80, damping: 20},
      inventory:[],
      inventoryDetail:[],
      fish:[],
      ships:[],
      citizens:[],
      clouds:[],
      resources:[],
      blockNumber:0,
      offlineCounter:0,
      avgBlockTime:5000,
      metamaskDip:0,
      buttonBumps:[],
      zoom:1.0,
      bottomBar:-80,
      bottomBarSize:20,
      bottomBarMessage:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:,",
      modalHeight:-600,
      modalObject:{name:"Loading..."},
      mapRightStart:(document.documentElement.clientWidth-300),
      mapBottomStart:(document.documentElement.clientHeight-80),
      mapUp:false,
      mapOverflow:"hidden",
      cornerOpacity:0,
      mapScrollConfig:{stiffness: 96, damping: 14},
      titleRightStart:26,
      titleBottomStart:18,
      titleScrollConfig:{stiffness: 60, damping: 14},
      mapIconConfig:{stiffness: 60, damping: 10},
      clickScreenWidth:document.documentElement.clientWidth,
      clickScreenHeight:document.documentElement.clientHeight,
      clickScreenTop:0,
      clickScreenOpacity:1,
      clickScreenConfig:{stiffness:28, damping: 20},
      experienceBuyShip:false,
      staticFillerShipsX:0,
      blockieRight:10,
      blockieTop:10,
      blockieSize:6,
      isEmbarking:false,
      previousModalObject:{name:"Loading..."},
      transactions:[],
      messages:[],
      islands:[],
      readyToDisplay:false,
      sea:[],
      loadingFeedback: "Galleass.io",
      loadingFeedback2: "",
      loadingFeedback3: "",
    }

    let timeoutLoader = 8000
    let timeoutLoaderInterval = 250
    let timeoutCount = 0
    let loadWatcher = setInterval(()=>{
      if(document.readyState=="complete" || ((timeoutCount++)*timeoutLoaderInterval) > timeoutLoader){
        //this.setState({})
        //if(this.state.clickScreenReadyToGetOut){
        //  this.setState({clickScreenOpacity:0})
        //  setTimeout(()=>{
        //
        //  },2000)
        //}else{
        if(this.state.readyToDisplay){
          this.setState({clickScreenOpacity:0,loaderOpacity:0})
          setTimeout(()=>{
            if(this.state.account){
              console.log("ACCOUNT+++++++++",this.state.account)
              axios.get('https://faucet.galleass.io/account/'+this.state.account)
              .then(function (response) {
                console.log("from backend...",response);
              })
              .catch(function (error) {
                console.log(error);
              });
              this.setState({clickScreenTop:-90000})
            }
          },1000)
          clearInterval(loadWatcher)
        }
      //  }
        //setTimeout(()=>{
        //  this.setState({loaderOpacity:0})
        //},4500)

      }
    },timeoutLoaderInterval)

    this.state.titleRight = this.state.titleRightStart;
    this.state.titleBottom = this.state.titleBottomStart;
    this.state.titleBottomFaster = this.state.titleBottomStart;
    this.state.mapRight = this.state.mapRightStart;
    this.state.mapBottom = this.state.mapBottomStart;

    setInterval(this.syncBlockNumber.bind(this),3777)


    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.connectWeb3()

    //setInterval(this.getGasPrice.bind(this),45000)
    //this.getGasPrice()
  }

  async connectWeb3(){
    this.setState({loadingFeedback2:"Connecting Web3..."})
    try{
      if (typeof window.web3 == 'undefined') {
        let provider = new BurnerProvider(RPCENDPOINT)
        web3 = new Web3(provider);
        web3.currentProvider = provider
        window.web3 = web3
        window.web3.version = {}
        window.web3.version.getNetwork = (cb)=>{
          cb(null,100)
        }
        console.log("BURNER IS READY IN APP",window.web3)
        window.web3.eth.getAccounts((err,_accounts)=>{


          console.log("GOT BURNER ACCOUNT IN APP",_accounts)
          //window.web3.eth.personal.unlockAccount(_accounts[0],"",9999999)
          setTimeout(()=>{
            //this.setState({readyToDisplay:true},()=>{
          //    this.init(_accounts[0])
            //})

          },6000)
          setTimeout(()=>{
            this.setState({loadingFeedback3:"Ethereum Account: "+_accounts[0]+"..."})
          },1500)

          setTimeout(()=>{
            this.setState({loadingFeedback2:"Network: xDai..."})
          },1000)


          setTimeout(()=>{
            this.setState({loadingFeedback3:"Ethereum Account: "+this.state.account+"..."})
          },2000)


        })
      }else{
        if(!web3){
          web3 = new Web3(window.web3.currentProvider)
        }


        setTimeout(async ()=>{
          let network = await web3.eth.net.getId()
          console.log("LOADED NETWORK ))))))",network)
          if(network==100){
            this.setState({loadingFeedback2:"Network: xDai"})
          }else{
            this.setState({loadingFeedback2:"Error, MetaMask network needs to be xDai..."})
          }

        },1000)


        setTimeout(async ()=>{
          let accounts = await web3.eth.getAccounts()
          this.setState({loadingFeedback3:" Account: "+accounts[0]+"..."})
        },2000)


        setTimeout(async ()=>{

          this.setState({loadingFeedback3:"Error, MetaMask is having troubles connecting..."})


        },8000)

        setTimeout(async ()=>{

          this.setState({
            loadingFeedback:"",
            loadingFeedback1:"",
            loadingFeedback2:""
          })

        },20000)






      }


      const ensABI = [{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"resolver","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"label","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setSubnodeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"ttl","type":"uint64"}],"name":"setTTL","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"node","type":"bytes32"}],"name":"ttl","outputs":[{"name":"","type":"uint64"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"resolver","type":"address"}],"name":"setResolver","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"node","type":"bytes32"},{"name":"owner","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":true,"name":"label","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"NewOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"owner","type":"address"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"resolver","type":"address"}],"name":"NewResolver","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"bytes32"},{"indexed":false,"name":"ttl","type":"uint64"}],"name":"NewTTL","type":"event"}]

      const daiABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"stop","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"owner_","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"symbol_","type":"bytes32"}],"name":"DSToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"name_","type":"bytes32"}],"name":"setName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stopped","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"authority_","type":"address"}],"name":"setAuthority","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"push","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"move","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"start","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"authority","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"guy","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"wad","type":"uint256"}],"name":"pull","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"authority","type":"address"}],"name":"LogSetAuthority","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"}],"name":"LogSetOwner","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"name":"sig","type":"bytes4"},{"indexed":true,"name":"guy","type":"address"},{"indexed":true,"name":"foo","type":"bytes32"},{"indexed":true,"name":"bar","type":"bytes32"},{"indexed":false,"name":"wad","type":"uint256"},{"indexed":false,"name":"fax","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"}]

      xdaiweb3 = new Web3(RPCENDPOINT)
      //try{
        console.log("connnecting to infura for mainnet balances...")
        mainnetweb3 = new Web3("https://mainnet.infura.io/v3/7c44d5e79492437fb709f60e196928b6")
        ensContract = new mainnetweb3.eth.Contract(ensABI,"0x314159265dD8dbb310642f98f50C066173C1259b")
        daiContract = new mainnetweb3.eth.Contract(daiABI,"0x6B175474E89094C44Da98b954EedeAC495271d0F")
      //}catch(e){
      //  console.log("Failing to connect to INFURA, TRYING MY MAINNET NODE?!?")
      //  mainnetweb3 = new Web3("https://rpc.eth.build:48544")
      //  ensContract = new mainnetweb3.eth.Contract(ensABI,"0x314159265dD8dbb310642f98f50C066173C1259b")
      //  daiContract = new mainnetweb3.eth.Contract(daiABI,"0x6B175474E89094C44Da98b954EedeAC495271d0F")
      //}






       if (window.ethereum) {
            try {
               // Request full provider if needed
               await window.ethereum.enable();
               // Full provider exposed
           } catch (error) {
               // User denied full provider access
           }
      }
      if(DEBUGCONTRACTLOAD) console.log("galleassAddress",galleassAddress)
      contracts["Galleass"] = new web3.eth.Contract(galleassAbi,galleassAddress)
      for(let c in loadContracts){
        loadContract(loadContracts[c],this)
      }
      waitInterval = setInterval(waitForAllContracts.bind(this),777)

    } catch(e) {
      console.log(e)
    }
  }

  transactionError(error){
    console.log("~~~~~~~~ ERROR",error)
    console.log("HANDLETHIS:",error)
      //this.setState({bottomBar:0,bottomBarMessage:"error:"+JSON.stringify(error),bottomBarSize:20})
    if(error.toString().indexOf("Error: Transaction was not mined")>=0){
      this.setState({loading:0,waitingForTransaction:false})
      clearInterval(txWaitIntervals["loader"])
      // clearInterval(txWaitIntervals[this.state.currentTx])
      this.setState({bottomBar:0,bottomBarMessage:"Warning: your transaction might not get mined, try increasing your #gas  gas price.",bottomBarSize:20})
      clearTimeout(bottomBarTimeout)
      bottomBarTimeout = setTimeout(()=>{
        this.setState({bottomBar:-80})
      },10000)
      //ACTUALLY LET'S JUST RELOAD AT THIS POINT
      //THIS NEEDS A LOT MORE WORK
      /////////////////////////////////window.location.reload(true);
    }
  }
  transactionHash(hash){
    console.log("~~~~~~~~ transactionHash",hash)
    //this.setState({bottomBar:0,bottomBarMessage:"hash:"+hash,bottomBarSize:20})
    let currentTransactions = this.state.transactions
    currentTransactions.push({hash:hash,time:Date.now()})
    this.setState({transactions:currentTransactions})
    this.closeModal()
  }
  transactionReceipt(receipt){
    //not using these because they don't work on mobile !!?
    /*
    console.log("~~~~~~~~ receipt",receipt)
    this.setState({bottomBar:0,bottomBarMessage:"receipt:"+JSON.stringify(receipt),bottomBarSize:20})
    let currentTransactions = this.state.transactions
    for(let t in currentTransactions){
      if(currentTransactions[t].hash == receipt.transactionHash){
        currentTransactions[t].receipt = receipt
        currentTransactions[t].time = Date.now()
      }
    }
    this.setState({transactions:currentTransactions})
    */
  }
  transactionThen(receipt,callback){

      /*console.log("~~~~~~~~ .THEN",receipt,callback)
      let currentTransactions = this.state.transactions
      for(let t in currentTransactions){
        if(currentTransactions[t].hash == receipt.transactionHash){
          currentTransactions[t].finished = Date.now()
        }
      }
      this.setState({transactions:currentTransactions})*/
  }
  transactionConfirmation(confirmationNumber,receipt){
    /*this.setState({bottomBar:0,bottomBarMessage:"confirmationNumber:"+confirmationNumber,bottomBarSize:20})
    let currentTransactions = this.state.transactions
    for(let t in currentTransactions){
      if(currentTransactions[t].hash == receipt.transactionHash){
        if(!currentTransactions[t].confirmations) currentTransactions[t].confirmations=1
        else currentTransactions[t].confirmations++
      }
    }
    this.setState({transactions:currentTransactions})*/
  }


  getGasPrice(){

        this.setState({GWEI:1.010101})
        return 1
  }

  async updateDimensions() {
    let clientWidth = document.documentElement.clientWidth
    let clientHeight = document.documentElement.clientHeight
    let mapRightStart = (clientWidth-300)
    let mapBottomStart = (clientHeight-80)
    let clickScreenWidth = clientWidth
    let clickScreenHeight = clientHeight

    let zoom = 1.0

    if(clientWidth<STARTZOOMAT){
      zoom=clientWidth/STARTZOOMAT
    }

    console.log(zoom)

    let update = {
      zoom: zoom,
      clientWidth: clientWidth,
      clientHeight: clientHeight,
      mapRightStart: mapRightStart,
      mapBottomStart: mapBottomStart,
      clickScreenWidth: clickScreenWidth,
      clickScreenHeight: clickScreenHeight
    }
    if(!this.state.mapUp){
      update.titleRight = this.state.titleRightStart
      update.titleBottom = this.state.titleBottomStart
      update.titleBottomFaster = this.state.titleBottomStart
      update.mapRight = mapRightStart
      update.mapBottom = mapBottomStart
    }else{
      update.titleRight = clientWidth/2-140
      update.titleBottom = clientHeight-68
      update.titleBottomFaster = clientHeight-68
    }

    this.setState(update)
    //this.scrollToMyShip()
  }
  async scrollToMyShip(){
    if(contracts["Bay"]){
      let myLocation = 2000;
      const accounts = await promisify(cb => web3.eth.getAccounts(cb));
      let getMyShip = await readContracts["Bay"].methods.getShip(accounts[0]).call();
      if(getMyShip&&getMyShip.floating){
        console.log("======Scrolling to MY myLocation",getMyShip.location)
        myLocation = 4000 * getMyShip.location / 65535
        this.setState({scrollLeft:(myLocation-document.documentElement.clientWidth/2)})
      }
    }
  }
  async loadIpfs(){
    if(contracts["Ipfs"]){
      console.log("==== Loading IPFS Address:")
      IPFSADDRESS = await readContracts["Ipfs"].methods.ipfs().call();
      console.log("==== IPFS:"+IPFSADDRESS)
    }
  }
  handleKeyPress(e) {
    if(e.keyCode === 27) {

      if(this.state.mapUp){
        this.titleClick()
      }else{
        this.closeModal()
      }
    }
  }
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
    document.addEventListener('keydown', this.handleKeyPress);




  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  setEtherscan(url){
    this.setState({etherscan:url})
  }
  init(account) {
    console.log("Init "+account+"...")

    //valid account.. pull the click screen
    //the only time this is needed is if they got all the way in on the right network but then
    //didn't unlock MM until after everything was up
    if(this.state.readyToDisplay){
      this.setState({clickScreenTop:-90000})
    }

    if(UPGRADING){
      console.log("Displaying upgrade screen...")
      this.openModal({
        simpleMessage:"Galleass.io is undergoing a contract upgrade",
        simpleMessage2:"we will be back online soon",
        simpleMessage3:"Thanks",
      })
    }else{
      this.setState({account:account})


      this.setState({bottomBar:0,bottomBarMessage:"Stage 1: Use a #Dogger  Dogger to catch #Fish  Fish and sell them for #Copper  Copper.",bottomBarSize:23})
      clearTimeout(bottomBarTimeout)
      bottomBarTimeout = setTimeout(()=>{
        this.setState({bottomBar:-80})
        setTimeout(()=>{
          this.setState({bottomBar:0,bottomBarMessage:"The #gas  Gas slider controls the cost and speed of transactions.",bottomBarSize:23})
          clearTimeout(bottomBarTimeout)
          bottomBarTimeout = setTimeout(()=>{
            this.setState({bottomBar:-80})
            setTimeout(()=>{
              this.setState({bottomBar:0,bottomBarMessage:"Get closer to #fish  Fish to increase the odds of catching them.",bottomBarSize:23})
              clearTimeout(bottomBarTimeout)
              bottomBarTimeout = setTimeout(()=>{
                this.setState({bottomBar:-80})
                setTimeout(()=>{
                  this.setState({bottomBar:0,bottomBarMessage:"Use the #mapicon  Map to navigate to other islands.",bottomBarSize:23})
                  clearTimeout(bottomBarTimeout)
                  bottomBarTimeout = setTimeout(()=>{
                    this.setState({bottomBar:-80})
                    setTimeout(()=>{
                      this.setState({bottomBar:0,bottomBarMessage:"Read the #help  Help section for more information.",bottomBarSize:23})
                      clearTimeout(bottomBarTimeout)
                      bottomBarTimeout = setTimeout(()=>{
                        this.setState({bottomBar:-80})
                        this.setState({bottomBar:0,bottomBarMessage:"Stage 1: Use a #Dogger  Dogger to catch #Fish  Fish and sell them for #Copper  Copper.",bottomBarSize:23})
                        clearTimeout(bottomBarTimeout)
                        bottomBarTimeout = setTimeout(()=>{
                          this.setState({bottomBar:-80})
                        },120000)
                      },30000)
                    },3000)
                  },30000)
                },3000)
              },30000)
            },3000)
          },30000)
        },3000)
      },30000)

      let buyShipBump = setInterval(()=>{
        if(this.state.experienceBuyShip){
          clearInterval(buyShipBump)
        }else{
          this.bumpButton("buyship")
          setTimeout(()=>{
            this.resetButton("buyship")
          },1000)
        }
      },3000)
    }


  }

  async sync(name,doSyncFn,CRAWLBACKDELAY,SYNCINVERVAL) {
    if(typeof eventLoadIndexes["sync"+name+"Down"] == "undefined"){
      eventLoadIndexes["sync"+name+"Down"] = this.state.blockNumber;
    }
    if(typeof eventLoadIndexes["sync"+name+"Live"] == "undefined"){
      eventLoadIndexes["sync"+name+"Live"] = this.state.blockNumber-1;
      setInterval(()=>{
        doSyncFn(eventLoadIndexes["sync"+name+"Live"],'latest')
        eventLoadIndexes["syncFishLive"]= this.state.blockNumber-1;
      },SYNCINVERVAL)
    }
    let nextChunk = eventLoadIndexes["sync"+name+"Down"]-EVENTLOADCHUNK;
    if(nextChunk<=galleassBlockNumber) nextChunk=galleassBlockNumber;
    await doSyncFn(nextChunk,eventLoadIndexes["sync"+name+"Down"])
    eventLoadIndexes["sync"+name+"Down"]=nextChunk;
    if(nextChunk>galleassBlockNumber) setTimeout(this.sync.bind(this,name,doSyncFn,CRAWLBACKDELAY,SYNCINVERVAL),CRAWLBACKDELAY)
  }

  async doSyncIslands(from,to) {
    let DEBUG_SYNCISLANDS = false
    let storedIslands = []
    if(from<1) from=1
    if(DEBUG_SYNCISLANDS) console.log("Sync ISLAND Chunk: "+from+" to "+to)
    let islandEvent = await readContracts["Land"].getPastEvents('LandGenerated', {
      fromBlock: from-1,
      toBlock: to
    })
    //uint16 _x,uint16 _y,uint8 _island1,uint8 _island2,uint8 _island3,uint8 _island4,uint8 _island5,uint8 _island6,uint8 _island7,uint8 _island8,uint8 _island9
    if(DEBUG_SYNCISLANDS) console.log("island...",islandEvent)
    for(let i in islandEvent){

      let _x = islandEvent[i].returnValues._x
      let _y = islandEvent[i].returnValues._y
      let id = _x+"_"+_y
      let _timestamp = islandEvent[i].returnValues._timestamp
      let _islands = [
        islandEvent[i].returnValues._island1,
        islandEvent[i].returnValues._island2,
        islandEvent[i].returnValues._island3,
        islandEvent[i].returnValues._island4,
        islandEvent[i].returnValues._island5,
        islandEvent[i].returnValues._island6,
        islandEvent[i].returnValues._island7,
        islandEvent[i].returnValues._island8,
        islandEvent[i].returnValues._island9
      ]
      if(!storedIslands[id] || storedIslands[id]._timestamp < _timestamp){
        if(DEBUG_SYNCISLANDS) console.log("&&&& IIISSSLLLLAAANNNDDDD!!!",id)
        storedIslands[id]={x:_x,y:_y,islands:_islands,timestamp:_timestamp};
      }
    }
    if(hasElements(storedIslands)){
      storedIslands = mergeByTimestamp(storedIslands,this.state.islands)
      if(DEBUG_SYNCISLANDS) console.log("SETSTATE storedIslands",storedIslands)
      this.setState({islands:storedIslands})
    }
  }

  async doSyncFish(from,to) {
    let DEBUG_SYNCFISH = false
    if(!this.state.landX || !this.state.landY){
      if(DEBUG_SYNCFISH) console.log("Skip sync, wait for land x,y")
      return;
    }
    let storedFish = []
    if(from<1) from=1
    let filter = {x:this.state.landX,y:this.state.landY}
    if(DEBUG_SYNCFISH) console.log("Sync Fish Chunk: "+from+" to "+to+" filtered by ",filter)
    let catchEvent = await readContracts["Bay"].getPastEvents('Catch', {
      filter: filter,
      fromBlock: from-1,
      toBlock: to
    })
    if(DEBUG_SYNCFISH) console.log("catch...",catchEvent)
    for(let f in catchEvent){
      let id = catchEvent[f].returnValues.id
      let species = catchEvent[f].returnValues.species
      let timestamp = catchEvent[f].returnValues.timestamp
      if(!storedFish[id] || storedFish[id].timestamp < timestamp){
        if(DEBUG_SYNCFISH) console.log("& SYNC FISH &&& CAAAATTTCH!!!",id)
        storedFish[id]={timestamp:timestamp,species:species,dead:true};
      }
    }
    if(DEBUG_SYNCFISH) console.log("Sync Fish Catch Chunk: "+from+" to "+to+" filtered by ",filter)
    let fish = await readContracts["Bay"].getPastEvents('Fish', {
      filter: filter,
      fromBlock: from-1,
      toBlock: to
    })
    if(DEBUG_SYNCFISH) console.log("fish...",fish)
    for(let f in fish){
      let id = fish[f].returnValues.id
      let species = fish[f].returnValues.species
      let timestamp = fish[f].returnValues.timestamp
      let image = fish[f].returnValues.image
      if(!storedFish[id] || storedFish[id].timestamp < timestamp){
        if(DEBUG_SYNCFISH) console.log(id)
        let result = await readContracts["Bay"].methods.fishLocation(id).call()
        storedFish[id]={timestamp:timestamp,species:species,x:result[0],y:result[1],dead:false,image:web3.utils.hexToUtf8(image)};
      }
    }
    if(hasElements(storedFish)){
      storedFish = mergeByTimestamp(storedFish,this.state.fish)
      if(DEBUG_SYNCFISH) console.log("SETSTATE storedFish",storedFish)
      this.setState({fish:storedFish})
    }
  }
  async doSyncCitizens(from,to){
    let DEBUG_SYNCCITIZENS = false;
    if(!this.state.landX || !this.state.landY){
      if(DEBUG_SYNCCITIZENS) console.log("Skip sync, wait for land x,y")
      return;
    }
    let filter = {x:this.state.landX,y:this.state.landY}
    if(DEBUG_SYNCCITIZENS) console.log("Sync Citizens With Filter ",filter)
    if(from<1) from=1
    let CitizenUpdate = await readContracts["Citizens"].getPastEvents('CitizenUpdate', {
      filter: filter,
      fromBlock: from,
      toBlock: to
    })
    if(DEBUG_SYNCCITIZENS) console.log("citizen...",CitizenUpdate)
    let storedCitizens = [];
    let updated = false;
    for(let c in CitizenUpdate){
      let id = CitizenUpdate[c].returnValues.id
      if(DEBUG_SYNCCITIZENS) console.log("CITIZEN UPDATE",CitizenUpdate[c])
      let blockNumber = CitizenUpdate[c].blockNumber
      if(!storedCitizens[id]||storedCitizens[id].blockNumber < blockNumber){
        if(DEBUG_SYNCCITIZENS) console.log(CitizenUpdate[c].returnValues)
        storedCitizens[id]={
          blockNumber:blockNumber,
          id:CitizenUpdate[c].returnValues.id,
          x:CitizenUpdate[c].returnValues.x,
          y:CitizenUpdate[c].returnValues.y,
          tile:CitizenUpdate[c].returnValues.tile,
          owner:CitizenUpdate[c].returnValues.owner,
          status:CitizenUpdate[c].returnValues.status,
          data:CitizenUpdate[c].returnValues.data,
          genes:CitizenUpdate[c].returnValues.genes,
          characteristics:CitizenUpdate[c].returnValues.characteristics
        };
      }
    }
    if(hasElements(storedCitizens)){
      storedCitizens = mergeByTimestamp(storedCitizens,this.state.citizens)
      if(DEBUG_SYNCCITIZENS) console.log("SETSTATE storedCitizens",storedCitizens)
      this.setState({citizens:storedCitizens})
    }
    //event CitizenUpdate(uint indexed id,uint16 indexed x, uint16 indexed y,uint8 tile,address owner,uint8 status,uint data,bytes32 genes,bytes32 characteristics);


  }
  async doSyncSea(from,to) {
    let DEBUG_SYNCSEA = false;
    if(from<1) from=1
    if(DEBUG_SYNCSEA) console.log("Sync Sea from ",from," to ",to)
    let seaEvents = await readContracts["Sea"].getPastEvents('ShipUpdate', {
      fromBlock: from,
      toBlock: to
    })
    if(DEBUG_SYNCSEA) console.log("sea events:",seaEvents)
    let storedSea = [];
    let updated = false;
    for(let b in seaEvents){
      let id = seaEvents[b].returnValues.contractAddress+"_"+seaEvents[b].returnValues.id
      let timestamp = seaEvents[b].returnValues.timestamp
      if(!storedSea[id]||storedSea[id].timestamp < timestamp){
        if(DEBUG_SYNCSEA) console.log("UPDATED SEA "+b,seaEvents[b].returnValues)
        storedSea[id]={
          timestamp:timestamp,
          id:seaEvents[b].returnValues.id,
          contractAddress:seaEvents[b].returnValues.contractAddress,
          floating:seaEvents[b].returnValues.floating,
          sailing:seaEvents[b].returnValues.sailing,
          x:seaEvents[b].returnValues.x,
          y:seaEvents[b].returnValues.y,
          location:seaEvents[b].returnValues.location,
          destX:seaEvents[b].returnValues.destX,
          destY:seaEvents[b].returnValues.destY,
          destLocation:seaEvents[b].returnValues.destLocation,
          destBlock:seaEvents[b].returnValues.destBlock
        };
      }
    }
    if(hasElements(storedSea)){
      storedSea = mergeByTimestamp(storedSea,this.state.sea)
      if(DEBUG_SYNCSEA) console.log("SETSTATE storedSea",storedSea)
      this.setState({sea:storedSea})
    }
  }
  async doSyncShips(from,to) {
    let DEBUG_SYNCSHIPS = false;
    if(DEBUG_SYNCSHIPS) console.log("Sync ships")
    if(from<1) from=1
    if(!this.state.landX||!this.state.landY){
      if(DEBUG_SYNCSHIPS) console.log("Waiting for land x,y")
      return;
    }
    let filter = {x:this.state.landX,y:this.state.landY}
    let ships = await readContracts["Bay"].getPastEvents('ShipUpdate', {
      filter: filter,
      fromBlock: from,
      toBlock: to
    })
    if(DEBUG_SYNCSHIPS) console.log("ship...",ships)
    let storedShips = [];
    let updated = false;
    for(let b in ships){
      let id = ships[b].returnValues.owner.toLowerCase()
      let timestamp = ships[b].returnValues.timestamp
      if(!storedShips[id]||storedShips[id].timestamp < timestamp){
        if(DEBUG_SYNCSHIPS) console.log("UPDATED SHIP "+b,ships[b].returnValues)
        storedShips[id]={
          timestamp:timestamp,
          id:ships[b].returnValues.id,
          owner:ships[b].returnValues.owner,
          floating:ships[b].returnValues.floating,
          sailing:ships[b].returnValues.sailing,
          direction:ships[b].returnValues.direction,
          fishing:ships[b].returnValues.fishing,
          blockNumber:ships[b].returnValues.blockNumber,
          location:ships[b].returnValues.location
        };
        if(DEBUG_SYNCSHIPS) console.log("FLOATING FOR "+b+" ("+id+") should be set to ",storedShips[id].floating)
      }
    }
    if(hasElements(storedShips)){
      storedShips = mergeByTimestamp(storedShips,this.state.ships)
      if(DEBUG_SYNCSHIPS) console.log("SETSTATE storedShips",storedShips)
      this.setState({ships:storedShips})
    }
  }
  async doSyncClouds(from,to) {
    const DEBUG_SYNCCLOUDS = false;
    let storedClouds = []
    if(from<1) from=1
    if(!this.state.landX||!this.state.landY){
      if(DEBUG_SYNCCLOUDS) console.log("Waiting for land x,y")
      return;
    }
    let filter = {x:this.state.landX,y:this.state.landY}
    let clouds = await readContracts["Sky"].getPastEvents('Cloud', {filter: filter,fromBlock: from,toBlock: to})
    for(let c in clouds){
      if(!storedClouds[clouds[c].transactionHash]){
        storedClouds[clouds[c].transactionHash] = clouds[c].returnValues
      }
    }
    if(hasElements(storedClouds)){
      storedClouds = mergeByTimestamp(storedClouds,this.state.clouds)
      if(DEBUG_SYNCCLOUDS) console.log("SETSTATE storedClouds",storedClouds)
      this.setState({clouds:storedClouds})
    }
  }
  async syncInventory() {
    const DEBUG_INVENTORY = false;

    console.log("CHECK THSES INF ",this.state,this.state.account,this.state.inventory)

    if(this.state && this.state.account && this.state.inventory){

      let inventory = this.state.inventory
      let inventoryDetail = this.state.inventoryDetail
      let update = false
      let updateDetail = false
      if(DEBUG_INVENTORY) console.log("account",this.state.account)

      let experienceBuyShip = await readContracts["Experience"].methods.experience(this.state.account,1).call()
      if(this.state.experienceBuyShip!=experienceBuyShip){
        console.log("experienceBuyShip update",experienceBuyShip);
        this.setState({experienceBuyShip:experienceBuyShip})
      }
      if(!experienceBuyShip&&this.state.messages.length<=0&&this.state.fishmongerIndex){
        console.log("this.state.fishmongerIndex",this.state.fishmongerIndex)
        setTimeout(()=>{
          this.setState({messages:[
            {
              id:'introfromfishmonger',
              from:'Fishmonger',
              data:'Salutations  #'+this.state.account+' '+this.state.account.substr(0,10)+', \n \n Welcome to Galleass, a charming, hand painted world filled with delightful anachronisms like blockchain in the age of sail. \n \n I am the humble Fishmonger of this island, but my friends refer to me as  #'+contracts["Fishmonger"]._address+' '+contracts["Fishmonger"]._address.substr(0,10)+'.   I purchase #fish  Fish to sell as #fillet  Fillets to feed your growing population of #citizen  Citizens. \n \n If you would like to try your hand at fishing, purchase a #dogger  Dogger at the #harbor  Harbor. When you catch fish, bring them to me at the #fishmonger  Fishmonger and I will reward you handsomely with #copper  Copper. \n \n                      Sincerely Yours,  #'+contracts["Fishmonger"]._address+' '+contracts["Fishmonger"]._address.substr(0,10)+' \n \n '
            }
          ]})
        },4000)
      }

      let experienceCatchFish = await readContracts["Experience"].methods.experience(this.state.account,2).call()
      if(this.state.experienceCatchFish!=experienceCatchFish){
        console.log("experienceCatchFish update",experienceCatchFish);
        this.setState({experienceCatchFish:experienceCatchFish})
      }

      if(inventory['Dogger']>0){
        let myShipArray = await readContracts["Dogger"].methods.tokensOfOwner(this.state.account).call()
        if(myShipArray && !isEquivalentAndNotEmpty(myShipArray,inventoryDetail['Dogger'])){
          inventoryDetail['Dogger']=myShipArray
          updateDetail=true
        }
      }

      for(let i in inventoryTokens){
        if(DEBUG_INVENTORY) console.log(contracts[inventoryTokens[i]])
        let balanceOf = await readContracts[inventoryTokens[i]].methods.balanceOf(this.state.account).call()
        if(DEBUG_INVENTORY) console.log("balanceOf",inventoryTokens[i],balanceOf)
        if(inventory[inventoryTokens[i]]!=balanceOf){
          inventory[inventoryTokens[i]] = balanceOf;
          update=true
        }
      }

      let balanceOfRealEther = Math.round(mainnetweb3.utils.fromWei(await mainnetweb3.eth.getBalance(this.state.account),"Ether")*ETHERPREC)/ETHERPREC;
      if(DEBUG_INVENTORY) console.log("balanceOfRealEther",balanceOfRealEther)
      if(inventory['RealEther']!=balanceOfRealEther){
        inventory['RealEther']=balanceOfRealEther
        update=true
      }

      let daiBalance = await daiContract.methods.balanceOf(this.state.account).call()
      daiBalance = parseFloat(mainnetweb3.utils.fromWei(""+daiBalance,'ether'))
      if(daiBalance){
        daiBalance = daiBalance.toFixed(2)
      }
      if(DEBUG_INVENTORY) console.log("daiBalance",daiBalance)
      if(inventory['DAI']!=daiBalance){
        inventory['DAI']=daiBalance
        update=true
      }

      let balanceOfEther = Math.round(web3.utils.fromWei(await xdaiweb3.eth.getBalance(this.state.account),"Ether")*ETHERPREC)/ETHERPREC;
      if(DEBUG_INVENTORY) console.log("balanceOfEther",balanceOfEther)
      if(inventory['Ether']!=balanceOfEther){
        inventory['Ether']=balanceOfEther
        update=true
      }

      if(update){
        console.log("INVENTORY UPDATE....")
        this.setState({loading:0,inventory:inventory,waitingForUpdate:false})
      }
      if(updateDetail){
        console.log("DETAIL INVENTORY UPDATE....")
        this.setState({loading:0,inventoryDetail:inventoryDetail,waitingForUpdate:false})
      }
    }
  }
  async syncMyShip() {
    const DEBUG_SYNCMYSHIP = false;
    if(DEBUG_SYNCMYSHIP) console.log("SYNCING MY SHIP")
    if(!this.state.landX||!this.state.landY){
      console.log("WAITING FOR LAND X,Y")
      return;
    }
    let myship = this.state.ship;
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    if(DEBUG_SYNCMYSHIP) console.log("Getting ship for account "+accounts[0])
    let getMyShip = await readContracts["Bay"].methods.getShip(this.state.landX,this.state.landY,accounts[0]).call();
    if(DEBUG_SYNCMYSHIP) console.log("COMPARE",this.state.ship,getMyShip)
    //if(JSON.stringify(this.state.ship)!=JSON.stringify(getMyShip)) {
    if(this.state.ship) getMyShip.inRangeToDisembark = this.state.ship.inRangeToDisembark
    let shipHasNotUpdated = isEquivalentAndNotEmpty(this.state.ship,getMyShip)
    if(getMyShip && !shipHasNotUpdated){

      let zoomPercent = 1/(parseInt(this.state.zoom*100)/100)
      /////console.log("zoomPercent",zoomPercent)
      if(DEBUG_SYNCMYSHIP) console.log("UPDATE MY SHIP",JSON.stringify(this.state.ship),JSON.stringify(getMyShip))
      let myLocation = 2000;
      if(getMyShip.floating){
        //console.log("======MY myLocation",getMyShip.location)
        myLocation = 4000 * getMyShip.location / 65535
        if(DEBUG_SYNCMYSHIP) console.log("myLocation",myLocation)
        //console.log("scrolling with zoom ",this.state.zoom)
        let windowWidthWithZoom = (document.documentElement.clientWidth) //* zoomPercent
        if(veryFirstLoad){
          veryFirstLoad=false;
          setTimeout(()=>{
            this.setState({scrollLeft:myLocation-windowWidthWithZoom/2})
          },10000)//delay so when it scrolls to the middle first it will scroll here next
        }else{
          this.setState({scrollLeft:myLocation-windowWidthWithZoom/2})
        }
      }
      //console.log("SHIP UPDATE ",getMyShip)
      try{
        getMyShip.inRangeToDisembark = await readContracts["Bay"].methods.inRangeToDisembark(this.state.landX,this.state.landY,accounts[0]).call();
        //console.log("getMyShip.inRangeToDisembark",getMyShip.inRangeToDisembark)
      }catch(e){console.log("ERROR checking inRangeToDisembark",e)}
      this.setState({/*zoom:HARDCODEDSCALE,*/loading:0,ship:getMyShip,waitingForUpdate:false,myLocation:myLocation},()=>{
        //if(DEBUG_SYNCMYSHIP)
        //console.log("SET getMyShip",this.state.ship)
      })
    }
  }
  async syncLand() {
    const DEBUG_SYNCLAND = false;
    if(DEBUG_SYNCLAND) console.log("SYNCING LAND")
    if(!this.state.landX || !this.state.landY){
      let url = window.location.href.substr(window.location.href.lastIndexOf("/")+1);
      let mainX = await readContracts["Land"].methods.mainX().call();
      console.log("mainX",mainX)
      let mainY = await readContracts["Land"].methods.mainY().call();
      console.log("mainY",mainY)
      let possibleX = false
      let possibleY = false
      if(url&&url.indexOf(".")>0){
        let xy = url.split(".")
        possibleX = parseInt(xy[0])
        possibleY = parseInt(xy[1])
      }
      if(possibleX && possibleY){
        mainX=possibleX
        mainY=possibleY
      }

      //we also want to track where the fishmoger is
      let fishmongerTileType = await readContracts["LandLib"].methods.tileTypes(web3.utils.fromAscii("Fishmonger")).call()
      let fishmongerIndex = await readContracts["Land"].methods.findTile(mainX,mainY,fishmongerTileType).call()
      if(fishmongerIndex==255) fishmongerIndex=false;
      //and the harbor
      let harborTileType = await readContracts["LandLib"].methods.tileTypes(web3.utils.fromAscii("Harbor")).call()
      let harborIndex = await readContracts["Land"].methods.findTile(mainX,mainY,harborTileType).call()
      this.setState({landX:mainX,landY:mainY,fishmongerIndex:fishmongerIndex,harborIndex:harborIndex},()=>{
        console.log("Reloading with Land x,y and fishmongerIndex",mainX,mainY,fishmongerIndex,harborIndex)
        //recall this function to do the other stuff
        this.syncLand()
        this.startEventSyncAfterLandIsLoaded()
      })
    }else{
      if(DEBUG_SYNCLAND) console.log("MAIN XY IS SET!!!")
      if(!this.state.readyToDisplay){
        this.setState({readyToDisplay:true})
      }
      let land = this.state.land;
      let landOwners = this.state.landOwners;
      let resources = this.state.resources;
      if(!land) land=[]
      if(!landOwners) landOwners=[]
      if(!resources) resources=[]
      for(let l=0;l<18;l++){
        //console.log("LOADING TILE",l)
        let currentTileHere = await readContracts["Land"].methods.tileTypeAt(this.state.landX,this.state.landY,l).call()
        let ownerOfTileHere = await readContracts["Land"].methods.ownerAt(this.state.landX,this.state.landY,l).call()
        let contractOfTileHere = await readContracts["Land"].methods.contractAt(this.state.landX,this.state.landY,l).call()
        let resourcesHere = {}
        //console.log("CONTRACT HERE",contractOfTileHere,currentTileHere,ownerOfTileHere,this.state.account)
        if(contractOfTileHere!="0x0000000000000000000000000000000000000000" && ownerOfTileHere && this.state.account && ownerOfTileHere.toLowerCase()==this.state.account.toLowerCase()){
          if(currentTileHere==150){
            //timber camp
            if(DEBUG_SYNCLAND) console.log("Checking on timber camp collect ...")
            let timberToCollect = await readContracts["TimberCamp"].methods.canCollect(this.state.landX,this.state.landY,l).call()
            //console.log("timberToCollect:",timberToCollect)
            if(timberToCollect>0){
              resourcesHere["Timber"]=timberToCollect
            }
          }
        }
        land[l]=currentTileHere
        landOwners[l]=ownerOfTileHere
        resources[l]=resourcesHere
      }
      if(land!=this.state.land || landOwners!=this.state.landOwners){
        //console.log("LAND UPDATE",land,landOwners)
        this.setState({land:land,landOwners:landOwners})
      }
      console.log("Loading Harbor Location",this.state.landX,this.state.landY,contracts["Harbor"]._address)
      let harborLocation = await readContracts["Land"].methods.getTileLocation(this.state.landX,this.state.landY,contracts["Harbor"]._address).call();
      console.log("GOT BACK harborLocation ",harborLocation)
      if(harborLocation!=this.state.harborLocation){
        harborLocation = parseInt(harborLocation)
        console.log("SAVING HARBOR LOCATION AS ",harborLocation)
        if(!harborLocation){
          this.setState({readyToDisplay:true,harborLocation:harborLocation,scrollLeft:parseInt(2000)-(document.documentElement.clientWidth/2)})
        }else{
          this.setState({readyToDisplay:true,harborLocation:harborLocation,scrollLeft:harborLocation-(document.documentElement.clientWidth/2)})
        }

      }
    }
  }
  async syncBlockNumber(){
    this.setState({staticFillerShipsX:this.state.staticFillerShipsX+2})

    console.log("checking block number....")
    if( !web3 || !web3.eth || typeof xdaiweb3.eth.getBlockNumber !="function" ){
      console.log("NOT THE RIGHT WEB3")
      let offlineCounter = this.state.offlineCounter;
      offlineCounter+=1;
      if(offlineCounter<3){
        this.setState({offlineCounter:offlineCounter})
      }else{
        let blockNumber = this.state.blockNumber;
        blockNumber+=1

        let thisBlockTime = Date.now()-this.state.lastBlockWasAt
        if(!thisBlockTime) thisBlockTime=1000
        let avgBlockTime = this.state.avgBlockTime*4/5+thisBlockTime/5

        console.log("BLOCKNUMBER:",blockNumber,"blockTime",thisBlockTime,"avgBlockTime",avgBlockTime)

        this.setState({offlineCounter:0,avgBlockTime:avgBlockTime,lastBlockWasAt:Date.now(),blockNumber:blockNumber})
      }

    }else{
      try{
        console.log("getting blick number.......")
        let blockNumber = await xdaiweb3.eth.getBlockNumber();
        console.log("blockNumber",blockNumber)
        if(this.state.blockNumber!=blockNumber){

          let thisBlockTime = Date.now()-this.state.lastBlockWasAt
          if(!thisBlockTime) thisBlockTime=20000
          let avgBlockTime = this.state.avgBlockTime*4/5+thisBlockTime/5

          console.log("BLOCKNUMBER:",blockNumber,"blockTime",thisBlockTime,"avgBlockTime",avgBlockTime)

          this.setState({avgBlockTime:avgBlockTime,lastBlockWasAt:Date.now(),blockNumber:blockNumber})
        }
      }catch(e){
        console.log(e)
      }

    }

  }

  async buySchooner() {
    console.log("buySchooner")
    this.bumpButton("buySchooner")
    if(!web3){
      //hint to install metamask
      this.metamaskHint()
    }else{
      try{
        const accounts = await promisify(cb => web3.eth.getAccounts(cb));
        console.log(accounts)
        if(!accounts[0]){
          this.metamaskHint()
        }else{
          let currentPrice = await readContracts["Harbor"].methods.currentPrice(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.fromAscii("Schooner")).call()
          console.log("current price for a buySchooner is",currentPrice)
          let xHex = parseInt(this.state.landX).toString(16)
          while(xHex.length<4) xHex="0"+xHex;
          let yHex = parseInt(this.state.landY).toString(16)
          while(yHex.length<4) yHex="0"+yHex;
          let iHex = parseInt(this.state.harborIndex).toString(16)
          while(iHex.length<2) iHex="0"+iHex;

          let shipHex = web3.utils.fromAscii("Schooner").replace("0x","")
          while(iHex.length%2!=0) shipHex="0"+shipHex;

          let action = "0x02" //BUY SHIP AT HARBOR
          let finalHex = action+xHex+yHex+iHex+shipHex
          console.log("Sending "+currentPrice+" copper to Harbor with data:"+finalHex)
          contracts["Copper"].methods.transferAndCall(contracts["Harbor"]._address,currentPrice,finalHex).send({
            from: accounts[0],
            gas:500000,
            gasPrice:Math.round(this.state.GWEI * 1000000000)
          },(error, transactionHash)=>{
            console.log(error,transactionHash)
            this.startWaiting(transactionHash)
          }).on('error',this.transactionError.bind(this))
          .on('transactionHash',this.transactionHash.bind(this))
          .on('receipt',this.transactionReceipt.bind(this)).
          on('confirmation', this.transactionConfirmation.bind(this))
          .then(this.transactionThen.bind(this));
          /*contracts["Harbor"].methods.buyShip(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.fromAscii("Dogger")).send({
            value: currentPrice,
            from: accounts[0],
            gas:210000,
            gasPrice:Math.round(this.state.GWEI * 1000000000)
          },(error,hash)=>{
            console.log("CALLBACK!",error,hash)
            // this.setState({currentTx:hash});
            if(!error) this.load()
            this.resetButton("buyship")
            this.startWaiting(hash,"inventoryUpdate")
          }).on('error',this.transactionError.bind(this))
          .on('transactionHash',this.transactionHash.bind(this))
          .on('receipt',this.transactionReceipt.bind(this))
          .on('confirmation', this.transactionConfirmation.bind(this))
          .then((receipt)=>{
            console.log("RESULT:",receipt)

          })*/
        }

      }catch(e){
        console.log(e)
        this.metamaskHint()
      }
    }
  }
  async buyShip() {
    console.log("BUYSHIP")
    this.bumpButton("buyship")
    if(!web3){
      //hint to install metamask
      this.metamaskHint()
    }else{
      try{
        const accounts = await promisify(cb => web3.eth.getAccounts(cb));
        console.log(accounts)
        if(!accounts[0]){
          this.metamaskHint()
        }else{
          let currentPrice = await readContracts["Harbor"].methods.currentPrice(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.fromAscii("Dogger")).call()
          console.log("current price for",FISHINGBOAT,"is",currentPrice)
          contracts["Harbor"].methods.buyShip(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.fromAscii("Dogger")).send({
            value: currentPrice,
            from: accounts[0],
            gas:210000,
            gasPrice:Math.round(this.state.GWEI * 1000000000)
          },(error,hash)=>{
            console.log("CALLBACK!",error,hash)
            // this.setState({currentTx:hash});
            if(!error) this.load()
            this.resetButton("buyship")
            this.startWaiting(hash,"inventoryUpdate")
          }).on('error',this.transactionError.bind(this))
          .on('transactionHash',this.transactionHash.bind(this))
          .on('receipt',this.transactionReceipt.bind(this))
          .on('confirmation', this.transactionConfirmation.bind(this))
          .then((receipt)=>{
            console.log("RESULT:",receipt)

          })
        }

      }catch(e){
        console.log(e)
        this.metamaskHint()
      }
    }
  }
  async disembark() {
    console.log("disembark")
    this.bumpButton("disembark")

    const accounts = await promisify(cb => web3.eth.getAccounts(cb));

    contracts["Bay"].methods.disembark(this.state.landX,this.state.landY,this.state.ships[this.state.account].id).send({
      from: accounts[0],
      gas:290000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      // this.setState({currentTx:hash});
      if(!error) this.load()
      this.resetButton("disembark")
      this.startWaiting(hash,"lockShipButtons")
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async embark(shipId) {
    console.log("embark")
    this.bumpButton("approveandembark")

    if(!shipId){
      shipId = this.state.inventoryDetail['Dogger'][0]
    }

    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    //console.log(accounts)
    //console.log("methods.embark(",this.state.inventoryDetail['Ships'][0])
    contracts["Bay"].methods.embark(this.state.landX,this.state.landY,shipId).send({
      from: accounts[0],
      gas:290000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      // this.setState({currentTx:hash});
      if(!error) this.load()
      this.resetButton("approveandembark")
      this.setState({isEmbarking:true})
      this.startWaiting(hash,"lockShipButtons")
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)

    })
  }
  async sellFish(x,y,i,fish,amount){
    if(!amount) amount=1
    console.log("SELL FISH ",x,y,i,fish,amount)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    let fishContract = contracts[fish];
    console.log("fishContractAddress:",fishContract._address)
    let paying = await readContracts["Fishmonger"].methods.price(x,y,i,fishContract._address).call()
    console.log("Fishmonger is paying ",paying," for ",fishContract._address)
    contracts["Fishmonger"].methods.sellFish(x,y,i,fishContract._address,amount).send({
      from: accounts[0],
      gas:250000+(amount*80000),
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async transferAndCall(x,y,i,contractName,amount,tokenName){
    console.log("BUY FILLET ",x,y,i)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));

    let xHex = parseInt(x).toString(16)
    while(xHex.length<4) xHex="0"+xHex;
    let yHex = parseInt(y).toString(16)
    while(yHex.length<4) yHex="0"+yHex;
    let iHex = parseInt(i).toString(16)
    while(iHex.length<2) iHex="0"+iHex;

    let data = "0x00"+xHex+yHex+iHex
    console.log("Final data:",data)

    contracts[tokenName].methods.transferAndCall(contracts[contractName]._address,amount,data).send({
      from: accounts[0],
      gas:250000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }

  async extractRawResource(x,y,i,amountOfCopper){
    console.log("Extract raw resource from ",x,y,i)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    let xHex = parseInt(x).toString(16)
    while(xHex.length<4) xHex="0"+xHex;
    let yHex = parseInt(y).toString(16)
    while(yHex.length<4) yHex="0"+yHex;
    let iHex = parseInt(i).toString(16)
    while(iHex.length<2) iHex="0"+iHex;
    let action = "0x03"
    let finalHex = action+xHex+yHex+iHex
    console.log("Sending "+amountOfCopper+" copper to LandLib with data:"+finalHex)
    contracts["Copper"].methods.transferAndCall(contracts["LandLib"]._address,amountOfCopper,finalHex).send({
      from: accounts[0],
      gas:250000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error, transactionHash)=>{
      console.log(error,transactionHash)
      this.startWaiting(transactionHash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this)).
    on('confirmation', this.transactionConfirmation.bind(this))
    .then(this.transactionThen.bind(this));

  }
  async testMarket(x,y,i){
    console.log("TEST MARKET")
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    let xHex = parseInt(x).toString(16)
    while(xHex.length<4) xHex="0"+xHex;
    let yHex = parseInt(y).toString(16)
    while(yHex.length<4) yHex="0"+yHex;
    let iHex = parseInt(i).toString(16)
    while(iHex.length<2) iHex="0"+iHex;
    let addressHex = contracts["Timber"]._address
    addressHex = addressHex.replace("0x","")
    if(addressHex.length%2==1){
      addressHex="0"+addressHex;
    }
    let amountToBuy = web3.utils.toHex(2)
    amountToBuy = amountToBuy.replace("0x","")
    if(amountToBuy.length%2==1){
      amountToBuy="0"+amountToBuy;
    }
    let amountOfCopper = 4
    let action = "0x01"
    let finalHex = action+xHex+yHex+iHex+addressHex+amountToBuy
    console.log("Test market at  x:"+xHex+" y:"+yHex+" i:"+iHex+" for "+amountOfCopper+" copper with finalHex: "+finalHex)
    contracts["Copper"].methods.transferAndCall(contracts["Market"]._address,amountOfCopper,finalHex).send({
      from: accounts[0],
      gas:550000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async buyFromMarket(x,y,i,tokenName,copperToSpend){
    console.log("buyFromMarket",x,y,i,tokenName,copperToSpend)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    let xHex = parseInt(x).toString(16)
    while(xHex.length<4) xHex="0"+xHex;
    let yHex = parseInt(y).toString(16)
    while(yHex.length<4) yHex="0"+yHex;
    let iHex = parseInt(i).toString(16)
    while(iHex.length<2) iHex="0"+iHex;
    let addressHex = contracts[tokenName]._address

    addressHex = addressHex.replace("0x","")
    if(addressHex.length%2==1){
      addressHex="0"+addressHex;
    }
    console.log("addressHex",addressHex)

    let amountOfCopper = copperToSpend
    let action = "0x01"
    let finalHex = action+xHex+yHex+iHex+addressHex
    console.log("%%%%%%%%%%%%%%%%% Buy "+tokenName+" at the market  x:"+xHex+" y:"+yHex+" i:"+iHex+" for "+amountOfCopper+" copper with finalHex: "+finalHex)
    contracts["Copper"].methods.transferAndCall(contracts["Market"]._address,amountOfCopper,finalHex).send({
      from: accounts[0],
      gas:550000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async sendEth(amount,toAddress){
    console.log("sendEth",amount,toAddress)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    web3.eth.sendTransaction({
      value: web3.utils.toWei(""+amount, "ether"),
      from: accounts[0],
      to: toAddress,
      gas:40000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async sendToken(name,amount,toAddress){
    console.log("sendToken",name,amount,toAddress)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    contracts[name].methods.transfer(toAddress,amount).send({
      from: accounts[0],
      gas:180000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async collect(name,tile){
    console.log("collect",name,tile,this.state.landX,this.state.landY)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    //  collect(uint16 _x,uint16 _y,uint8 _tile)
    let timberToCollect = await readContracts["TimberCamp"].methods.canCollect(this.state.landX,this.state.landY,tile).call()
    contracts[name].methods.collect(this.state.landX,this.state.landY,tile).send({
      from: accounts[0],
      gas:20000+75000*timberToCollect,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async setCitizenPrice(id,price){
    let wei = web3.utils.toWei(""+price,'ether')
    console.log("setCitizenPrice",id,price,wei)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    contracts["CitizensLib"].methods.setPrice(id,wei).send({
      from: accounts[0],
      gas:130000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async moveCitizen(id,tile){
    console.log("moveCitizen",id,tile)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    contracts["CitizensLib"].methods.moveCitizen(id,tile).send({
      from: accounts[0],
      gas:130000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async createCitizen(x,y,tile,food1,food2,food3){
    console.log("createCitizen",x,y,tile,food1,food2,food3)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    contracts["Village"].methods.createCitizen(x,y,tile,web3.utils.fromAscii(food1),web3.utils.fromAscii(food2),web3.utils.fromAscii(food3)).send({
      from: accounts[0],
      gas:450000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async buildTile(tileIndex,newTileType){
    console.log("buildTile",tileIndex,newTileType)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    //let filletPrice = await contracts["Fishmonger"].methods.filletPrice().call()
    //console.log("Fishmonger charges ",filletPrice," for fillets")
    //
    let mainX = await readContracts["Land"].methods.mainX().call();
    let mainY = await readContracts["Land"].methods.mainY().call();
    //buildTile(uint16 _x, uint16 _y,uint8 _tile,uint16 _newTileType)
    console.log("BUILDTILE",mainX,mainY,tileIndex,newTileType)
    contracts["LandLib"].methods.buildTile(mainX,mainY,tileIndex,newTileType).send({
      from: accounts[0],
      gas:450000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  async buildTimberCamp(x,y,i,citizenId){
    let copper = 6
    let action = "0x02"
    console.log("BUILD TIMBER CAMP ",x,y,i,copper)

    let xHex = parseInt(x).toString(16)
    while(xHex.length<4) xHex="0"+xHex;
    let yHex = parseInt(y).toString(16)
    while(yHex.length<4) yHex="0"+yHex;
    let iHex = parseInt(i).toString(16)
    while(iHex.length<2) iHex="0"+iHex;

    let citizenHex = web3.utils.toHex(""+citizenId)

    console.log("hex:",xHex,yHex,iHex,citizenHex)

    const accounts = await promisify(cb => web3.eth.getAccounts(cb));

    console.log("Building timber camp at  x:"+xHex+" y:"+yHex+" i:"+iHex+" for "+copper+" copper with citizen "+citizenHex)
    citizenHex = citizenHex.replace("0x","")
    if(citizenHex.length%2==1){
      citizenHex="0"+citizenHex;
    }
    let finalHex = action+xHex+yHex+iHex+citizenHex
    console.log("finalHex:",finalHex)
    contracts["Copper"].methods.transferAndCall(contracts["LandLib"]._address,copper,finalHex).send({
      from: accounts[0],
      gas:450000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })

  }
  async buyLand(x,y,i,copper){
    console.log("BUY LAND ",x,y,i,copper)

    let xHex = parseInt(x).toString(16)
    while(xHex.length<4) xHex="0"+xHex;
    let yHex = parseInt(y).toString(16)
    while(yHex.length<4) yHex="0"+yHex;
    let iHex = parseInt(i).toString(16)
    while(iHex.length<2) iHex="0"+iHex;

    console.log("hex:",xHex,yHex,iHex)

    const accounts = await promisify(cb => web3.eth.getAccounts(cb));

    console.log("Purchasing land for account ("+accounts[0]+") x:"+xHex+" y:"+yHex+" i:"+iHex+" for "+copper+" copper")
    contracts["Copper"].methods.transferAndCall(contracts["LandLib"]._address,copper,"0x01"+xHex+yHex+iHex).send({
      from: accounts[0],
      gas:380000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }
  handleFocus(event) {
    event.target.select();
  }
  handleModalInput(e){
    console.log(e.target.value)
    let obj = this.state.modalObject
    obj.price = e.target.value
    this.setState({modalObject:obj})
  }
  async setLandPrice(x,y,i,copper){
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));
    console.log("Setting price of land x:"+x+" y:"+y+" i:"+i+" to "+copper+" copper")
    contracts["Land"].methods.setPrice(x,y,i,copper).send({
      from: accounts[0],
      gas:180000,
      gasPrice:Math.round(this.state.GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.startWaiting(hash)
    }).on('error',this.transactionError.bind(this))
    .on('transactionHash',this.transactionHash.bind(this))
    .on('receipt',this.transactionReceipt.bind(this))
    .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
      console.log("RESULT:",receipt)
    })
  }

  setSail(direction){
    console.log("SET SAIL")
    if(direction) this.bumpButton("saileast")
    else this.bumpButton("sailwest")
    window.web3.eth.getAccounts((err,_accounts)=>{
      console.log(this.state.landX,this.state.landY,direction,_accounts[0])
      contracts["Bay"].methods.setSail(this.state.landX,this.state.landY,direction).send({
        from: _accounts[0],
        gas:110000,
        gasPrice:Math.round(this.state.GWEI * 1000000000)
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        // this.setState({currentTx:hash});
        if(!error) this.load()
        if(direction) this.resetButton("saileast")
        else this.resetButton("sailwest")
        this.startWaiting(hash,"lockShipButtons")
      }).on('error',this.transactionError.bind(this))
      .on('transactionHash',this.transactionHash.bind(this))
      .on('receipt',this.transactionReceipt.bind(this))
      .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
        console.log("RESULT:",receipt)

      })
    })
  }
  dropAnchor(){
    console.log("DROP ANCHOR")
    this.bumpButton("dropanchor")
    window.web3.eth.getAccounts((err,_accounts)=>{
      console.log(_accounts)
      contracts["Bay"].methods.dropAnchor(this.state.landX,this.state.landY).send({
        from: _accounts[0],
        gas:100000,
        gasPrice:Math.round(this.state.GWEI * 1000000000)
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        // this.setState({currentTx:hash});
        if(!error) this.load()
        this.resetButton("dropanchor")
        this.startWaiting(hash,"lockShipButtons")
      }).on('error',this.transactionError.bind(this))
      .on('transactionHash',this.transactionHash.bind(this))
      .on('receipt',this.transactionReceipt.bind(this))
      .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
        console.log("RESULT:",receipt)

      })
    })
  }
  castLine(){
    console.log("CAST LINE")
    this.bumpButton("castline")
    window.web3.eth.getAccounts((err,_accounts)=>{
      let bait = web3.utils.sha3(Math.random()+_accounts[0])
      console.log(bait)
      let baitHash = web3.utils.sha3(bait)
      this.setState({bait:bait,baitHash:baitHash})
      contracts["Bay"].methods.castLine(this.state.landX,this.state.landY,baitHash).send({
        from: _accounts[0],
        gas:110000,
        gasPrice:Math.round(this.state.GWEI * 1000000000)
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        // this.setState({currentTx:hash});
        if(!error) this.load()
        this.resetButton("castline")
        this.startWaiting(hash,"lockShipButtons")
      }).on('error',this.transactionError.bind(this))
      .on('transactionHash',this.transactionHash.bind(this))
      .on('receipt',this.transactionReceipt.bind(this))
      .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
        console.log("RESULT:",receipt)

      })
    })
  }
  reelIn(){
    console.log("REEL IN")
    this.bumpButton("reelin")

    const DEBUG_REEL_IN = false;
    window.web3.eth.getAccounts((err,_accounts)=>{
      //console.log(_accounts)

      let bestDist = width*width
      let bestId = false
      let myShip = this.state.ships[this.state.account];

      for(let f in this.state.fish){
        if(DEBUG_REEL_IN) console.log("f",f)
        if(this.state.fish[f].dead){
          //console.log("DEAD FISH IGNORE ",f)
        }else{
          let a = parseInt(this.state.fish[f].x)
          let b = parseInt(myShip.location)
          if(DEBUG_REEL_IN) console.log(a,b)
          let x = myShip.location-this.state.fish[f].x
          let y = 0-this.state.fish[f].y
          if(DEBUG_REEL_IN) console.log(x,y)
          let diff = Math.sqrt(x*x + (y*y/90));
          if(DEBUG_REEL_IN) console.log("DIFF TO ",f,"IS",diff)
          if(DEBUG_REEL_IN) console.log(f,diff)
          //console.log("this.state.fish.x",this.state.fish[f].x,"myShip.location",myShip.location,diff)
          if( diff < bestDist ){

            bestDist=diff
            bestId=f
            //if(DEBUG_REEL_IN)
            console.log("========== found closer ",bestDist,bestId)
          }
        }
      }
      //console.log(myShip)
      if(DEBUG_REEL_IN) console.log("BAIT",this.state.bait)
      if(DEBUG_REEL_IN) console.log("BESTS",bestDist,bestId)

      let baitToUse = this.state.bait
      if(!baitToUse||baitToUse=="false") baitToUse="0x0000000000000000000000000000000000000000";
      if(!bestId||bestId=="false") bestId="0x0000000000000000000000000000000000000000";

      if(DEBUG_REEL_IN) console.log("FINAL ID BAIT & ACCOUNT",bestId,baitToUse,_accounts[0])

      contracts["Bay"].methods.reelIn(this.state.landX,this.state.landY,bestId,baitToUse).send({
        from: _accounts[0],
        gas:290000,
        gasPrice:Math.round(this.state.GWEI * 1000000000)
      },(error,hash)=>{
        console.log("CALLBACK!",error,hash)
        // this.setState({currentTx:hash});
        if(!error) this.load()
        this.resetButton("reelin")
        this.startWaiting(hash,"lockShipButtons")


        //setTimeout(
        //  ()=>{
        //    console.log("DOING A FORCE SYNC FOR Sync Fish NOW")
        //    this.syncEverythingOnce()

        //  },5000
        //)
      }).on('error',this.transactionError.bind(this))
      .on('transactionHash',this.transactionHash.bind(this))
      .on('receipt',this.transactionReceipt.bind(this))
      .on('confirmation', this.transactionConfirmation.bind(this)).then((receipt)=>{
        if(DEBUG_REEL_IN) console.log("RESULT:",receipt)

      })
    })
  }

  metamaskHint(){
    this.setState({metamaskDip:20},()=>{
      setTimeout(()=>{
        this.setState({metamaskDip:0})
      },550)
    })
  }

  updateLoader(){
    //console.log("UPDATE LOADER")
    let next = parseInt(this.state.loading)+1;
    if(next>24) {
      next=23;
    }else{
      //console.log("loading next",next,web3)
      this.setState({loading:next})
    }
  }
  async startWaitingForTransaction(hash,waitAfterFirstStage){
    //this.setState({bottomBar:0,bottomBarMessage:"Polling",bottomBarSize:24})
    //this.setState({loading:0}
    let DEBUGWAITINGFORTX = true
    //clearInterval(txWaitIntervals["loader"])

    if(DEBUGWAITINGFORTX) console.log(" ~~~~ WAITING FOR TRANSACTION ",hash,waitAfterFirstStage,this.state.waitingForTransaction,this.state.waitingForTransactionTime)
    try {
      var receipt = await xdaiweb3.eth.getTransactionReceipt(hash);
      //this.setState({bottomBar:0,bottomBarMessage:"Polled:"+JSON.stringify(receipt),bottomBarSize:24})

      if(DEBUGWAITINGFORTX) console.log("~~ TIME SPENT:"+Date.now()-this.state.waitingForTransactionTime)
      if (receipt == null) {
        //keep waiting
      } else {
        if(DEBUGWAITINGFORTX) console.log("~~~ DONE WITH TX",receipt)
        if(DEBUGWAITINGFORTX) console.log("~~~~~~~~ polled receipt",receipt)
        let currentTransactions = this.state.transactions
        for(let t in currentTransactions){
          if(currentTransactions[t].hash == receipt.transactionHash){
            currentTransactions[t].polledreceipt = receipt
            currentTransactions[t].time = Date.now()
          }
        }
        this.setState({transactions:currentTransactions})


        let thisHashToWatch = hash
        //console.log("------------------------- setting timeout to finish ",thisHashToWatch)
        setTimeout(()=>{
          //console.log("+++++++++++++++++++++============= finishing trans ",thisHashToWatch)
          let currentTransactions = this.state.transactions
          for(let t in currentTransactions){
            if(currentTransactions[t].hash == thisHashToWatch){
              currentTransactions[t].done = true
              currentTransactions[t].time = Date.now()
            }
          }
          this.setState({transactions:currentTransactions})
        },5000)
        setTimeout(()=>{
          let currentTransactions = this.state.transactions
          for(let t in currentTransactions){
            if(currentTransactions[t].hash == thisHashToWatch){
              currentTransactions[t].closed = true
              currentTransactions[t].time = Date.now()
            }
          }
          this.setState({transactions:currentTransactions})
        },15000)


        clearInterval(txWaitIntervals[hash])
        txWaitIntervals[hash]=null
        clearInterval(txWaitIntervals["loader"])

        if(receipt.status=="0x0"||receipt.status=="0x00"){
          this.setState({loading:0,waitingForTransaction:false,waitingForUpdate:false})
          this.setState({bottomBar:0,bottomBarMessage:"Warning: Transaction failed. Try again with a higher #gas  gas price.",bottomBarSize:24})
          clearTimeout(bottomBarTimeout)
          bottomBarTimeout = setTimeout(()=>{
            this.setState({bottomBar:-80})
          },10000)
        }else{
          console.log(" `````` end of first phase of tx, now green bar...... waitAfterFirstStage:"+waitAfterFirstStage)
          if(false && waitAfterFirstStage){//force this off for a sec
            console.log(" ~~~~ This is a ship transaction so make sure we wait for an update with green bar....")
            this.setState({loading:0,waitingForTransaction:false,waitingForUpdate:true,waitingForTransactionTime:Date.now()},()=>{
              if(DEBUGWAITINGFORTX) console.log("CALL A SYNC OF EVERYTHING!!")
              this.syncEverythingOnce()
              if(DEBUGWAITINGFORTX) console.log("IS EMBARKING",this.state.isEmbarking)
              if(this.state.isEmbarking){
                //hint by animating the blockie down
                this.waitForShipToFloatThenDoBlockieHint()
              }
            })
          }else{
            console.log(" ~~~~ This is a simple transaction don't wait for ship update with green bar....")
            this.setState({loading:0,waitingForTransaction:false},()=>{
              if(DEBUGWAITINGFORTX) console.log("CALL A SYNC OF EVERYTHING!!")
              this.syncEverythingOnce()
            })
          }
        }
      }
    } catch(e) {
      console.log("ERROR WAITING FOR TX",e)
      clearInterval(txWaitIntervals[hash]);
      this.setState({loading:0,waitingForTransaction:false})
    }
    if(DEBUGWAITINGFORTX) console.log("DONE WAITING ON TRANSACTION")
  }
  waitForShipToFloatThenDoBlockieHint(){
    if(this.state.ship&&this.state.ship.floating){
      setTimeout(this.doBlockieHint.bind(this),1000)
    }else{
      setTimeout(this.waitForShipToFloatThenDoBlockieHint.bind(this),1000)
    }
  }
  async doBlockieHint(){
    if(this.state.ship&&this.state.ship.floating){
      let xOffset = this.state.scrollLeft-document.documentElement.scrollLeft
      setTimeout(()=>{
        this.setState({isEmbarking:false,blockieTop:454-document.documentElement.scrollTop,blockieRight:(this.state.clientWidth/2-45)-xOffset,blockieSize:2})
        setTimeout(()=>{
          this.setState({blockieTop:10,blockieRight:10,blockieSize:6})
        },3100)
      },500)
    }
  }
  bumpButton(name){
    let currentBumps = this.state.buttonBumps
    if(!currentBumps[name]) currentBumps[name]= 15
    else currentBumps[name]+= 15
    this.setState({currentBumps:currentBumps})
  }
  resetButton(name){
    let currentBumps = this.state.buttonBumps
    currentBumps[name]=0
    this.setState({currentBumps:currentBumps})
  }

  load(){
    console.log("LOAD!")
    this.setState({loading:1},()=>{
      console.log("SET INTERVALE")
      txWaitIntervals["loader"] = setInterval(this.updateLoader.bind(this),LOADERSPEED)
    })
  }
  startWaiting(hash,nextPhase){
    if(hash){
      console.log("STARTWAITING",hash,nextPhase)
      let update = {waitingForTransaction:hash,waitingForTransactionTime:Date.now()}
      let shipTx = (nextPhase=="lockShipButtons"||nextPhase=="inventoryUpdate")
      if(shipTx){
        update.waitingForUpdate=true
      }else{
        update.waitingForUpdate=false
      }

      this.setState(update,()=>{
        txWaitIntervals[hash] = setInterval(this.startWaitingForTransaction.bind(this,hash,shipTx),RECEIPTPOLL)
        this.startWaitingForTransaction(hash,shipTx)
        /*setTimeout(()=>{
          console.log("CHECKING BACK ON TX ",hash,txWaitIntervals[hash])
          if(txWaitIntervals[hash]){
            clearInterval(txWaitIntervals[hash]);
            this.setState({loading:0,waitingForTransaction:false})
            clearInterval(txWaitIntervals["loader"])
            this.setState({bottomBar:0,bottomBarMessage:"Warning: Your transaction is taking a long time, try increasing your #gas  gas price.",bottomBarSize:20})
            clearTimeout(bottomBarTimeout)
            bottomBarTimeout = setTimeout(()=>{
              this.setState({bottomBar:-80})
            },10000)
          }

        },this.state.avgBlockTime*2)*/
      })
    }
  }

  startEventSync() {
    console.log("Finished loading contracts and block number, start syncing events...",this.state.blockNumber)
    clearInterval(waitInterval);
    //if(this.state.clickScreenOpacity==0){
      //this.setState({avgBlockTime:15000,contractsLoaded:true,clickScreenTop:-90000})//clickScreenTop:-90000,clickScreenOpacity:0
    //}else{
      this.setState({avgBlockTime:5000,contractsLoaded:true})
    //}
    //}

    this.sync("Sea",this.doSyncSea.bind(this),3198,SHIPSEVENTSYNCLIVEINTERVAL);


    setInterval(this.syncMyShip.bind(this),4777)
    setInterval(this.syncInventory.bind(this),3777)
    console.log("SET LAND INTERVAL")
    setInterval(this.syncLand.bind(this),25333)

    this.syncEverythingOnce()
  }
  syncEverythingOnce() {
    this.syncLand()
    this.syncBlockNumber()
    this.syncMyShip()
    this.syncInventory()
    console.log("do Sync Fish from syncEverythingOnce")
    this.doSyncFish(this.state.blockNumber-5,this.state.blockNumber)
    this.doSyncShips(this.state.blockNumber-5,this.state.blockNumber)
    this.doSyncCitizens(this.state.blockNumber-5,this.state.blockNumber)
    this.doSyncClouds(this.state.blockNumber-5,this.state.blockNumber)
    this.doSyncIslands(this.state.blockNumber-5,this.state.blockNumber)
    this.doSyncSea(this.state.blockNumber-5,this.state.blockNumber)
  }
  startEventSyncAfterLandIsLoaded(){
    //we need to wait to sync all fish until we have landX and landY set
    console.log("do Sync Fish FULL")
    this.sync("Fish",this.doSyncFish.bind(this),1000,FISHEVENTSYNCLIVEINTERVAL);
    this.sync("Ships",this.doSyncShips.bind(this),1000,SHIPSEVENTSYNCLIVEINTERVAL);
    this.sync("Citizens",this.doSyncCitizens.bind(this),1000,SHIPSEVENTSYNCLIVEINTERVAL);
    this.sync("Clouds",this.doSyncClouds.bind(this),1000,CLOUDEVENTSYNCLIVEINTERVAL);
    this.sync("Islands",this.doSyncIslands.bind(this),1000,ISLANDEVENTINTERVAL);
    this.syncEverythingOnce()
  }
  bumpableButton(name,buttonsTop,fn){
    let buttonBounce = parseInt(this.state.buttonBumps[name])
    if(!buttonBounce) buttonBounce = 0
    //console.log("buttonBounce",buttonBounce)
    return (
      <Motion key={"Button"+name}
      defaultStyle={{
        top:buttonsTop
      }}
      style={{
        top:spring(buttonsTop+buttonBounce,{stiffness: 150, damping: 5})// presets.noWobble)
      }}
      >
      {fn}
      </Motion>
    )
  }
  updateMessages(messages){
    this.setState({messages:messages})
  }
  openModal(modalObject){
    this.setState({
      //loaderOpacity:0,
      modalObject:modalObject,
      previousModalObject:this.state.modalObject,//this let's your layer up two modals
      modalHeight:100,
      clickScreenTop:0,
      clickScreenOpacity:0.9
    })
  }
  closeModal(){
    //I setup previousModalObject so there could be one modal and then another
    //and you could return to the first one, but I haven't used it yet
    let modalObject = this.state.previousModalObject
    /*if(modalObject.name!="Loading..."){/////////// this stuff is for stacking modals.. skipping for now
    this.setState({
    modalObject:modalObject,
    previousModalObject:{"name":"Loading..."}
  })
}else{*/
this.setState({
  //loaderOpacity:1,
  modalHeight:-600,
  clickScreenTop:-5000,
  clickScreenOpacity:0,
  previousModalObject:{"name":"Loading..."},
  modalObject:{"name":"Loading..."}
})
//}
}
titleClick(){
  console.log("Clicked Title")
  if(this.state.mapUp){
    this.setState({
      mapUp:false,
      mapOverflow:"scroll",

      cornerOpacity:0,
      mapRight:this.state.mapRightStart,
      mapBottom:this.state.mapBottomStart,
      titleRight:this.state.titleRightStart,
      titleBottom:this.state.titleBottomStart,
      titleBottomFaster:this.state.titleBottomStart,
      bottomBar:-80,
    })
  }else{
    this.setState({
      mapUp:true,
      mapOverflow:"hidden",
      cornerOpacity:1,
      mapRight:0,
      mapBottom:0,
      titleRight:this.state.clientWidth/2-140,
      titleBottom:this.state.clientHeight-68,
      titleBottomFaster:this.state.clientHeight-68,
      bottomBar:0,
      bottomBarMessage:"Here be monsters on the blockchain...",
      bottomBarSize:24
    })
  }
}
async tileClick(name,index,px) {
  console.log("TILE CLICK",name,index,px)
  this.openModal({loading:true})
  let tile = await readContracts['Land'].methods.getTile(this.state.landX,this.state.landY,index).call();
  let claimPrice = 0
  if(tile._owner=="0x0000000000000000000000000000000000000000"){
    claimPrice = await readContracts['LandLib'].methods.OPENLANDTILECOST().call();
  }
  let modalObject = {
    name:name,
    contract:tile._contract,
    owner:tile._owner,
    ownsTile:(this.state.account && tile._owner && this.state.account.toLowerCase()==tile._owner.toLowerCase()),
    price:tile._price,
    claimPrice:claimPrice,
    index:index,
    px:px,
    citizens:[],
    inventoryTokens:inventoryTokens,
    web3:web3,
    contracts:contracts,
    GWEI:this.state.GWEI,
    landX:this.state.landX,
    landY:this.state.landY,
    transactionHash:this.transactionHash.bind(this),
    transactionReceipt:this.transactionReceipt.bind(this),
    transactionConfirmation:this.transactionConfirmation.bind(this),
    transactionError:this.transactionError.bind(this),
    startWaiting:this.startWaiting.bind(this),
  }
  for(let c in this.state.citizens){
    if( this.state.citizens[c].x==this.state.landX && this.state.citizens[c].y==this.state.landY && this.state.citizens[c].tile==index ){
      let citizenObject = {
        id:this.state.citizens[c].id,
        owner:this.state.citizens[c].owner,
        status:this.state.citizens[c].status,
        data:this.state.citizens[c].data,
        geneObject: await readContracts["CitizensLib"].methods.getCitizenGenes(this.state.citizens[c].id).call()
      };
      modalObject.citizens.push(citizenObject)
    }
  }

  //sometimes each tile will have a different balance, show the local balance
  //sometimes you will want to show the global balance of the contract backing the tile
  //(probably if there is a single contract deployed for the tile)
  let calculateBalanceGlobally = true;


  if(name=="Harbor"){
    modalObject.doggers = await readContracts["Harbor"].methods.countShips(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.asciiToHex("Dogger")).call();
    modalObject.doggerPrice = await readContracts["Harbor"].methods.currentPrice(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.asciiToHex("Dogger")).call();

    modalObject.schooners = await readContracts["Harbor"].methods.countShips(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.asciiToHex("Schooner")).call();
    modalObject.schoonerPrice = await readContracts["Harbor"].methods.currentPrice(this.state.landX,this.state.landY,this.state.harborIndex,web3.utils.asciiToHex("Schooner")).call();
  }

  if(name=="Fishmonger"){
    modalObject.fish = [
      "Pinner",
      "Redbass",
      "Catfish",
      "Snark",
      "Dangler",
    ]
    modalObject.prices = []
    for(let f in modalObject.fish){
      modalObject.prices[modalObject.fish[f]] = await readContracts["Fishmonger"].methods.price(this.state.landX,this.state.landY,index,contracts[modalObject.fish[f]]._address).call();
    }
    modalObject.filletPrice = await readContracts["Fishmonger"].methods.filletPrice(this.state.landX,this.state.landY,index).call();

    let fishmongerTokens = ["Copper","Fillet"]
    modalObject.tokenBalance = {}
    for(let i in fishmongerTokens){
      modalObject.tokenBalance[fishmongerTokens[i]] = parseInt(await readContracts["Fishmonger"].methods.tokenBalance(this.state.landX,this.state.landY,index,contracts[fishmongerTokens[i]]._address).call());
    }
    //each tile will have a different balance, show the local balance
    calculateBalanceGlobally=false;
  }



  if(name=="Market"){
    let marketTokens = inventoryTokens//["Copper","Timber","Fillet","Greens"]
    modalObject.sellPrices = {}
    modalObject.buyPrices = {}
    modalObject.tokenBalance = {}
    for(let i in marketTokens){
      modalObject.sellPrices[marketTokens[i]] = parseInt(await readContracts["Market"].methods.sellPrices(this.state.landX,this.state.landY,index,contracts[marketTokens[i]]._address).call());
      modalObject.buyPrices[marketTokens[i]] = parseInt(await readContracts["Market"].methods.buyPrices(this.state.landX,this.state.landY,index,contracts[marketTokens[i]]._address).call());
      modalObject.tokenBalance[marketTokens[i]] = parseInt(await readContracts["Market"].methods.tokenBalance(this.state.landX,this.state.landY,index,contracts[marketTokens[i]]._address).call());
    }
    //each tile will have a different balance, show the local balance
    calculateBalanceGlobally=false;
  }

  if(name=="Timber Camp"){
    modalObject.resourceMin = (await readContracts["TimberCamp"].methods.min().call()).replace(/[^a-z0-9]/gmi, "")
    modalObject.resourceMax = (await readContracts["TimberCamp"].methods.max().call()).replace(/[^a-z0-9]/gmi, "")
    modalObject.resourceType = (web3.utils.hexToAscii(await readContracts["TimberCamp"].methods.resource().call())).replace(/[^a-z0-9A-Z ]/gmi, "")
  }


  //if we have a contract for this tile, check the balance and display tokens that the contract owns
  if(calculateBalanceGlobally){
    let cleanName = name.replace(" ","")
    if(contracts[cleanName]){
      if(contracts[cleanName].methods.getBalance) modalObject.balance = await readContracts[cleanName].methods.getBalance().call();
      modalObject.copperBalance = await readContracts["Copper"].methods.balanceOf(readContracts[cleanName]._address).call();
      modalObject.filletBalance = await readContracts["Fillet"].methods.balanceOf(readContracts[cleanName]._address).call();
      modalObject.timberBalance = await readContracts["Timber"].methods.balanceOf(readContracts[cleanName]._address).call();
      modalObject.doggerBalance = await readContracts["Dogger"].methods.balanceOf(readContracts[cleanName]._address).call();
      console.log("copperBalance",contracts["Copper"]._address,cleanName,contracts[cleanName]._address,modalObject.copperBalance)
    }
  }

  this.openModal(modalObject)
}
async invClick(name,contract) {
  console.log("INV CLICK",name,contract)
  let modalObject
  if(name=="Ether"){
    modalObject = {
      name:name,
      balance: web3.utils.fromWei(await xdaiweb3.eth.getBalance(this.state.account),"Ether"),
      wallet:true
    }
  }else if(name=="RealEther"){
    modalObject = { }
    const burnerKey = localStorage.getItem('metaPrivateKey')
    if(burnerKey){
        window.open("https://xdai.io/pk#"+burnerKey)
    }else{
        window.open("https://xdai.io/")
    }
    return
  }else if(name=="DAI"){
    const burnerKey = localStorage.getItem('metaPrivateKey')
    if(burnerKey){
        window.open("https://xdai.io/pk#"+burnerKey)
    }else{
        window.open("https://xdai.io/")
    }
    return
  }else{
    modalObject = {
      name:name,
      contract:contract._address,
      balance: await readContracts[name].methods.balanceOf(this.state.account).call(),
      token:true
    }

    //check if the token is a fish and add in fish monger details
    let fish = [
      "Pinner",
      "Redbass",
      "Catfish",
      "Snark",
      "Dangler",
    ]
    console.log("ISNAME ",name,fish)
    if(fish.indexOf(name)>=0){
      modalObject.isFish = true
      modalObject.prices = {}
      for(let f in fish){
        console.log("Getting price:",this.state.landX,this.state.landY,this.state.fishmongerIndex)
        modalObject.prices[fish[f]] = await readContracts["Fishmonger"].methods.price(this.state.landX,this.state.landY,this.state.fishmongerIndex,contracts[fish[f]]._address).call();
      }
    }

    if(typeof contracts[name].methods.tokensOfOwner == "function"){
      //erc721
      modalObject.tokensOfOwner = await readContracts[name].methods.tokensOfOwner(this.state.account).call()
      modalObject.tokens = {}
      for(let tokenId in modalObject.tokensOfOwner){
        modalObject.tokens[modalObject.tokensOfOwner[tokenId]] = await readContracts[name].methods.getToken(modalObject.tokensOfOwner[tokenId]).call()
        console.log("GOT TOKEN DATA",modalObject.tokens[modalObject.tokensOfOwner[tokenId]])
        //load specific functions for specific tokens
        if(name=="Citizens"){
          modalObject.tokens[modalObject.tokensOfOwner[tokenId]].geneObject = await readContracts['CitizensLib'].methods.getCitizenGenes(modalObject.tokensOfOwner[tokenId]).call()
          //modalObject.tokens[modalObject.tokensOfOwner[tokenId]].statusObject = await contracts[name].methods.getCitizenStatus(modalObject.tokensOfOwner[tokenId]).call()
          modalObject.tokens[modalObject.tokensOfOwner[tokenId]].characteristicsObject = await readContracts['CitizensLib'].methods.getCitizenCharacteristics(modalObject.tokensOfOwner[tokenId]).call()
        }
      }
    }else{
      //erc20
    }
  }
  this.openModal(modalObject)
}
setHintMode(num){
  console.log("HINT MODE",num)
  //1 means take them to metamask install
  //0 means just keep shaking the metamask hint
  this.setState({hintMode:num})
  if(num==1){
    //since they don't have metamask or something, go ahead and show the base stuff
    setTimeout(()=>{
      this.setState({readyToDisplay:true})
    },3500)
  }
}
clickScreenClick(event){
  var userAgent = window.navigator.userAgent;
  let clickXRatio = event.clientX/this.state.clickScreenWidth;
  let clickYRatio = event.clientY/this.state.clickScreenHeight;
  console.log("CLICK SCREEN CLICKED",this.state.account,event.clientX,event.clientY,clickXRatio,clickYRatio,userAgent)

  if(!this.state.account){
    if(clickXRatio>0.73 && clickYRatio<0.15){
      window.open('https://metamask.io', '_blank');
    }else if(clickXRatio<0.25 && clickYRatio<0.15){
      window.open('https://austingriffith.com/portfolio/galleass/', '_blank');
    }else if(clickXRatio>0.95 && clickYRatio>0.95){
      window.open('https://join.slack.com/t/galleass/shared_invite/enQtMzg5MDk3ODg4NzQxLTRhYmVlZDZhMjRkZjIzYmFhZDc1MWE5ZGMyNjBiYzg1Y2I3M2FlYjlhMDI4NDkyNTFlZDAwM2QzMzhhMTM3MmQ', '_blank');
    }
  }

  if(this.state.modalHeight>=0){
    this.closeModal()
  }else{
    this.metamaskHint()
  }
}
handleWhiskeyStart(){
  this.setState({gweiOpacity:0.8})
}
handleWhiskeyStop(){
  this.setState({gweiOpacity:0.3})
}
handleWhiskeyDrag(mouse,obj){
  let currentPercent = obj.x + (STARTINGGWEI/MAXGWEI*100);
  let actualGWEI = Math.round(currentPercent/100 * MAXGWEI*10,1)/10;
  if(actualGWEI<MINGWEI) actualGWEI=MINGWEI;
  if(actualGWEI>MAXGWEI) actualGWEI=MAXGWEI;
  this.setState({GWEI:actualGWEI})
}
mapWheel(obj,b,c){
  if(this.state.mapUp){
    let scaleTo=1.0;
    if(obj.deltaY>0){
      scaleTo = Math.round((this.state.mapScale+0.05)*100)/100
    }else{
      scaleTo = Math.round((this.state.mapScale-0.05)*100)/100
    }
    console.log("SCALE TO",scaleTo)
    this.setState({mapScale:scaleTo})
    obj.stopPropagation()
    obj.preventDefault()
  }
}
testSomething(){
  console.log("TEST SOMETHING")
  //this.waitForShipToFloatThenDoBlockieHint()
}
render() {
  let buttons = [];
  if(!this.state){
    return (
      <div key={"LOADING"}>Loading</div>
    )
  }

  let myShip
  if(this.state/*&&this.state.shipsOfOwner*/){
    myShip = this.state.ship;
  }
  //console.log("myShip",myShip)

  //both of these are in sync and we need to test which is fastest
  // one is all of the ship events while the other is doing a get ship
  //let myShip = this.state.ship;
  //console.log(myShip)
  //myShip = this.state.ships[this.state.account];
  //console.log("console.log(myShip)",myShip)

  //if(myShip) console.log("myShip FISHING:",myShip.fishing)
  //if(this.state.ship) console.log("FISHING this.state.ship:",this.state.ship.fishing,)

  //console.log("ACCOUNT",this.state.account)
  //console.log("SHIPS:",this.state.ships)
  let buttonsTop = horizon-260;
  let buttonPushDown = 30
  let buttonsLeft = -1000;
  let loadingBar = ""

  if(this.state.harborLocation>0){
    buttonsLeft = this.state.harborLocation
  }else{
    buttonsLeft=-1000;
  }

  if(myShip&&myShip.floating&&myShip.location){
    buttonsLeft = this.state.myLocation
    if(buttonsLeft<300) buttonsLeft=300
    if(buttonsLeft>3700) buttonsLeft=3700
  }
  if(!buttonsLeft) buttonsLeft=-2000

  let buttonOpacity = 0.9
  let buttonDisabled = false
  //console.log("loading:",this.state.loading,"waitingForUpdate:",this.state.waitingForUpdate)
  if(this.state.loading){
    buttonOpacity = 0.5
    buttonDisabled = true
    loadingBar = (
      <img src={"preloader_"+this.state.loading+".png"} />
    )
  } else if( this.state.waitingForUpdate){
    buttonOpacity = 0.3
    buttonDisabled = true
    let timeSpentWaiting = Date.now() - this.state.waitingForTransactionTime
    timeSpentWaiting = Math.floor(timeSpentWaiting/1200)+1;
    //console.log("timeSpentWaiting",timeSpentWaiting)
    /*if(timeSpentWaiting>30){
      window.location.reload(true);
    }*/
    if(timeSpentWaiting>12) timeSpentWaiting=12
    loadingBar = (
      <img src={"loader_"+timeSpentWaiting+".png"} />
    )
  }

  //console.log("MY SHIP",myShip)

  if(!myShip||!myShip.floating){
    if(!this.state||!this.state.contractsLoaded){
      //wait for contracts to load but for now let's preload some stuff off screen???
    }else if(this.state.harborLocation && this.state.inventoryDetail && (!this.state.inventoryDetail['Dogger']||this.state.inventoryDetail['Dogger'].length<=0) && this.state.inventory['Dogger']<=0){
      let clickFn = this.buyShip.bind(this)
      if(buttonDisabled){clickFn=()=>{}}
      buttons.push(
        this.bumpableButton("buyship",buttonsTop,(animated) => {
          if(animated.top>50) animated.top=50
          let extraWidth = animated.top - buttonsTop
          let theLeft = this.state.harborLocation-75+((extraWidth)/2)
          if(!theLeft){
            return (<div></div>)
          }else{
            return (
              <div key={"buyship"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:theLeft,top:animated.top+buttonPushDown,opacity:buttonOpacity}} onClick={clickFn}>
              <img src="buyship.png" style={{transform:"scale("+adjustedInvZoom+")",zIndex:700,maxWidth:150-(extraWidth)}}/>
              </div>
            )
          }
        }
      )
    )
  }else if(this.state.inventory['Dogger']>0){
    let clickFn = this.embark.bind(this,false)
    if(buttonDisabled){clickFn=()=>{}}
    if(this.state.inventoryDetail['Dogger'] && this.state.inventoryDetail['Dogger'].length>0){
      buttons.push(
        this.bumpableButton("approveandembark",buttonsTop,(animated) => {
          if(animated.top>50) animated.top=50
          let extraWidth = animated.top - buttonsTop
          return (
            <div key={"approveAndEmbark"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:buttonsLeft-75+((extraWidth)/2),top:animated.top+buttonPushDown,opacity:buttonOpacity}} onClick={clickFn}>
            <img src="approveAndEmbark.png" style={{transform:"scale("+adjustedInvZoom+")",maxWidth:150-(extraWidth)}}/>
            </div>
          )
        }
      )
    )
  }else{
    //console.log("WAITING FOR INV DETAIL....")
    buttons.push(
      <div key={"waiting"}>
      </div>
    )
  }
}else if(this.state.harborLocation){
  let clickFn = this.metamaskHint.bind(this)
  if(buttonDisabled){clickFn=()=>{}}
  buttons.push(
    this.bumpableButton("buyshipHolder",buttonsTop,(animated) => {
      if(animated.top>50) animated.top=50
      let extraWidth = animated.top - buttonsTop
      let theLeft = this.state.harborLocation-75+((extraWidth)/2);
      if(!theLeft){
        return (
          <div>
          </div>
        )
      }else{
        return (
          <div key={"buyshipHolder"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:theLeft,top:animated.top+buttonPushDown,opacity:buttonOpacity}} onClick={clickFn}>
          <img src="buyship.png" style={{transform:"scale("+adjustedInvZoom+")",maxWidth:150-(extraWidth)}}/>
          </div>
        )
      }

    })
  )
}


}else if(myShip.sailing){
  let clickFn = this.dropAnchor.bind(this)
  if(buttonDisabled){clickFn=()=>{}}
  buttons.push(
    this.bumpableButton("dropanchor",buttonsTop,(animated) => {
      if(animated.top>50) animated.top=50
      let extraWidth = animated.top - buttonsTop
      return (
        <div key={"dropanchor"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:buttonsLeft-75+((extraWidth)/2),top:animated.top+buttonPushDown,opacity:buttonOpacity}} onClick={clickFn}>
        <img src="dropanchor.png" style={{transform:"scale("+adjustedInvZoom+")",maxWidth:150-(extraWidth)}}/>
        </div>
      )
    }
  )
)
}else if(myShip.fishing){
  let clickFn = this.reelIn.bind(this);
  if(buttonDisabled){clickFn=()=>{}}
  let buttonBounce = parseInt(this.state.buttonBumps['reelin'])
  if(!buttonBounce) buttonBounce = 0
  //console.log("buttonBounce",buttonBounce)
  buttons.push(
    this.bumpableButton("reelin",buttonsTop,(animated) => {
      if(animated.top>50) animated.top=50
      let extraWidth = animated.top - buttonsTop
      return (
        <div key={"reelin"} style={{cursor:"pointer",zIndex:700,position:'absolute',top:animated.top+buttonPushDown,left:buttonsLeft-75+((extraWidth)/2),opacity:buttonOpacity}} onClick={clickFn}>
        <img src="reelin.png" style={{transform:"scale("+adjustedInvZoom+")",maxWidth:150-(extraWidth)}}/>
        </div>
      )
    })
  )
}else{
  let clickFn1 = this.setSail.bind(this,true)
  if(buttonDisabled){clickFn1=()=>{}}
  buttons.push(
    this.bumpableButton("saileast",buttonsTop,(animated) => {
      if(animated.top>50) animated.top=50
      let extraWidth = animated.top - buttonsTop
      return (
        <div key={"saileast"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:buttonsLeft+180*adjustedInvZoom-75+((extraWidth)/2),top:animated.top+buttonPushDown,opacity:buttonOpacity}} onClick={clickFn1}>
        <img src="saileast.png" style={{transform:"scale("+adjustedInvZoom+")",maxWidth:150-(extraWidth)}}/>
        </div>
      )
    })
)
let clickFn2 = this.castLine.bind(this,true)
if(buttonDisabled){clickFn2=()=>{}}
buttons.push(
  this.bumpableButton("castline",buttonsTop,(animated) => {
    if(animated.top>50) animated.top=50
    let extraWidth = animated.top - buttonsTop
    return (
      <div key={"castLine"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:buttonsLeft-75+((extraWidth)/2),top:animated.top+buttonPushDown,opacity:buttonOpacity}} onClick={clickFn2}>
      <img src="castLine.png" style={{transform:"scale("+adjustedInvZoom+")",maxWidth:150-(extraWidth)}}/>
      </div>
    )
  })

)
let clickFn3 = this.setSail.bind(this,false)
if(buttonDisabled){clickFn3=()=>{}}
buttons.push(
  this.bumpableButton("sailwest",buttonsTop,(animated) => {
    if(animated.top>50) animated.top=50
    let extraWidth = animated.top - buttonsTop
    return (
      <div key={"sailwest"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:buttonsLeft-180*adjustedInvZoom-75+((extraWidth)/2),top:animated.top+buttonPushDown,opacity:buttonOpacity}} onClick={clickFn3}>
      <img src="sailwest.png" style={{transform:"scale("+adjustedInvZoom+")",maxWidth:150-(extraWidth)}}/>
      </div>
    )
  })
)
/*
let clickFn = this.disembark.bind(this)
buttons.push(
this.bumpableButton("disembark",buttonsTop,(animated) => {
if(animated.top>50) animated.top=50
let extraWidth = animated.top - buttonsTop
let theLeft = this.state.harborLocation-(50/2)+((extraWidth)/2)
let theOpacity = buttonOpacity
if(!this.state.ship.inRangeToDisembark){
theOpacity=0.25
clickFn=()=>{
this.setState({bottomBar:0,bottomBarMessage:"You must be closer to the harbor to disembark.",bottomBarSize:28})
clearTimeout(bottomBarTimeout)
bottomBarTimeout = setTimeout(()=>{
this.setState({bottomBar:-80})
},10000)
}
}
if(!theLeft){
return (<div></div>)
}else{
return (
<div key={"disembark"} style={{cursor:"pointer",zIndex:700,position:'absolute',left:theLeft,top:animated.top+160,opacity:theOpacity}} onClick={clickFn}>
<img src="disembark.png" style={{maxWidth:50-(extraWidth)}}/>
</div>
)
}
}
)
)*/
}
buttons.push(
  <div style={{zIndex:701,position:'absolute',left:buttonsLeft-50,top:buttonsTop+50+buttonPushDown/2,opacity:0.7}}>
  {loadingBar}
  </div>
)


let menuSize = 60;
let menu = (
  <div key={"MENU"} style={{transform:"scale("+this.state.zoom+")",width:"100%",position:"fixed",left:0+((1-this.state.zoom)*180),top:0-((1-this.state.zoom)*30),height:menuSize,borderBottom:"0px solid #a0aab5",color:"#DDDDDD",zIndex:99}} >
  <Motion
  defaultStyle={{
    marginRight:0
  }}
  style={{
    marginRight: spring(this.state.metamaskDip,{stiffness: 80, damping: 7})// presets.noWobble)
  }}
  >
  {currentStyles => {
    return (
      <div style={currentStyles}>
      <Metamask
      clickBlockie={this.doBlockieHint.bind(this)}
      setHintMode={this.setHintMode.bind(this)}
      account={this.state.account}
      init={this.init.bind(this)}
      Blockies={Blockies}
      blockNumber={this.state.blockNumber}
      etherscan={this.state.etherscan}
      setEtherscan={this.setEtherscan.bind(this)}
      lastBlockWasAt={this.state.lastBlockWasAt}
      avgBlockTime={this.state.avgBlockTime}
      blockieRight={this.state.blockieRight}
      blockieTop={this.state.blockieTop}
      blockieSize={this.state.blockieSize}
      zoom={this.state.zoom}
      />
      </div>
    )
  }}
  </Motion>


  </div>
)
//(-1)*this.state.zoom*180/2
//(-position:"absolute",left:document.scrollingElement.scrollLeft+this.state.clientWidth-100-100*this.state.zoom,

let adjustedInvZoom = Math.min(1,this.state.zoom * 1.7)

let rightOffset = ((1-adjustedInvZoom)*135)
let inventory = (
  <div style={{transform:"scale("+adjustedInvZoom+")",position:"fixed",right:10-rightOffset,top:(100*(adjustedInvZoom))-35,width:200,border:"0px solid #a0aab5",color:"#DDDDDD",zIndex:99}} >
  <div style={{marginRight:0}}>
  <Inventory
  invClick={this.invClick.bind(this)}
  inventory={this.state.inventory}
  Ships={this.state.Ships}
  /*sellFish={this.sellFish.bind(this)}*/
  contracts={contracts}
  etherscan={this.state.etherscan}
  />
  </div>
  </div>
)
let bay = (
  <div style={{position:"absolute",left:0,top:0,width:width,height:height,overflow:'hidden'}} >
  <div style={{position:'absolute',left:0,top:0,opacity:1,backgroundSize:"cover",backgroundImage:"url('sky.jpg')",backgroundRepeat:'no-repeat',height:horizon,width:width}}></div>
  <Clouds web3={xdaiweb3} clouds={this.state.clouds} horizon={horizon} width={width} blockNumber={this.state.blockNumber}/>
  <div style={{position:'absolute',left:0,top:horizon,opacity:1,backgroundImage:"url('oceanblackblur.jpg')",backgroundRepeat:'no-repeat',height:height+horizon,width:width}}></div>
  {buttons}
  <Ships
  account={this.state.account}
  ships={this.state.ships}
  width={width}
  height={height}
  horizon={horizon+100}
  Blockies={Blockies}
  web3={xdaiweb3}
  shipSpeed={shipSpeed}
  blockNumber={this.state.blockNumber}
  etherscan={this.state.etherscan}
  />
  <Fish web3={xdaiweb3} fish={this.state.fish} width={width} height={height} horizon={horizon+150} />
  </div>
)
//  <div style={{zIndex:11,position:'absolute',left:0,top:horizon,opacity:.7,backgroundImage:"url('oceanfront.png')",backgroundRepeat:'no-repeat',height:height+horizon,width:width}}></div>

let land = (
  <div style={{position:"absolute",left:0,top:horizon-60,width:width}} >
  <Land collect={this.collect.bind(this)} land={this.state.land} landOwners={this.state.landOwners} resources={this.state.resources} Blockies={Blockies} web3={web3} tileClick={this.tileClick.bind(this)}/>
  </div>
)

if(!this.state.contractsLoaded) buttons="";

let galley= (
  <div key={"galley"} style={{
    zIndex:20,
    position:'absolute',
    left:500+this.state.staticFillerShipsX,
    top:500,
    opacity:0.9,
    height:75,
    width:140
  }}>
  <img src={"galley.png"} />
  <div style={{
    position:'absolute',
    top:24,
    left:21
  }}>
  <Blockies
  seed={"galley"}
  scale={2.3}
  />
  </div>
  </div>
)

let galleass= (
  <div key={"galleass"} style={{
    zIndex:20,
    position:'absolute',
    left:3700+this.state.staticFillerShipsX,
    top:500,
    opacity:0.9,
    height:131,
    width:170
  }}>
  <img src={"galleass.png"} />
  <div style={{
    position:'absolute',
    top:5,
    left:-6
  }}>
  <Blockies
  seed={galleassAddress}
  scale={3.1}
  />
  </div>
  </div>
)
let starttop = this.state.clickScreenHeight*2/3
let clickScreen = (
  <Motion
  defaultStyle={{
    opacity:1
  }}
  style={{
    opacity:spring(this.state.clickScreenOpacity,this.state.clickScreenConfig)
  }}
  >
  {currentStyles => {
    return (
      <div style={{cursor:'pointer',width:this.state.clickScreenWidth,height:this.state.clickScreenHeight,opacity:currentStyles.opacity,backgroundColor:"#0a1727",position:"fixed",left:0,top:this.state.clickScreenTop,zIndex:899}} onClick={this.clickScreenClick.bind(this)}>

        <div id="outer" style={{width:"100%"}}>
          <div id="inner" style={{textAlign:"left",display:"table",marginLeft:"20%"}}>
          <div>
              <img style={{
                position:"absolute",top:this.state.clickScreenHeight*1/3,
                zIndex:-99,
                width:Math.max(this.state.clickScreenWidth/16,100),
                opacity:this.state.loaderOpacity,
              }} src="loading3.gif" />
            </div>
            <div style={{filter:"invert(1)",position:"absolute",top:starttop}}><Writing string={this.state.loadingFeedback} size={32}/></div>
            <div style={{filter:"invert(1)",position:"absolute",top:starttop+32}}><Writing string={this.state.loadingFeedback2} size={32}/></div>
            <div style={{filter:"invert(1)",position:"absolute",top:starttop+64}}><Writing string={this.state.loadingFeedback3} size={32}/></div>
          </div>
        </div>
      </div>
    )
  }}
  </Motion>
)


let titlescaleoffsetleft = (-5+(1-this.state.zoom)*-145)+document.scrollingElement.scrollLeft;
let titlescaleoffsettop = 20+(1-this.state.zoom)*-57+document.scrollingElement.scrollTop;

return (
  <div className="App">
  <ReactHint events delay={100} />

  <div id="preloadthebuttons" style={{position:"absolute",left:-1000,top:-1000}}>
    <img src={"dropanchor.png"} />
    <img src={"buyship.png"} />
    <img src={"approveAndEmbark.png"} />
    <img src={"reelin.png"} />
    <img src={"saileast.png"} />
    <img src={"castLine.png"} />
    <img src={"sailwest.png"} />
  </div>

  {menu}

  {clickScreen}
  {inventory}

  <Transactions
    GWEI={this.state.GWEI}
    zoom={this.state.zoom}
    etherscan={this.state.etherscan}
    avgBlockTime={this.state.avgBlockTime}
    transactions={this.state.transactions}
    web3={web3}
  />

  <Messages
    zoom={this.state.zoom}
    messages={this.state.messages}
    contracts={contracts}
    readContracts={readContracts}
    openModal={this.openModal.bind(this)}
    updateMessages={this.updateMessages.bind(this)}
  />


  {bay}
  {land}


  <Sea
  landX={this.state.landX}
  landY={this.state.landY}
  account={this.state.account}
  sea={this.state.sea}
  width={width}
  height={height}
  horizon={horizon+100}
  Blockies={Blockies}
  web3={web3}
  blockNumber={this.state.blockNumber}
  etherscan={this.state.etherscan}
  />

  <Motion
  defaultStyle={{
    right:this.state.mapRightStart,
    bottom:this.state.mapBottomStart,
    titleRight:this.state.titleRightStart,
    titleBottom:this.state.titleBottomStart,
    titleBottomFaster:this.state.titleBottomStart,
    overflow:"hidden",
  }}
  style={{
    right:spring(this.state.mapRight,this.state.mapScrollConfig),
    bottom:spring(this.state.mapBottom,this.state.mapScrollConfig),
    titleRight:spring(this.state.titleRight,this.state.titleScrollConfig),
    titleBottom:spring(this.state.titleBottom,this.state.titleScrollConfig),
    titleBottomFaster:spring(this.state.titleBottom,this.state.mapIconConfig),
    overflow:this.state.mapOverflow,
  }}
  >
  {currentStyles => {
    //  console.log(this.state.land)
    let currentTotal = 0
    let islands = []
    for(let i in this.state.land){
      if(this.state.land[i]==0){
        if(currentTotal>0){
          islands.push(currentTotal)
          currentTotal=0
        }else{
          currentTotal=0
        }
      }else{
        currentTotal++
      }
    }
    if(currentTotal>0){
      islands.push(currentTotal)
    }
    //console.log("islands",islands)
    // let offset = 0
    // let islandRender = islands.map((island)=>{
    //   offset+=30
    //   //console.log(island,"@",offset)
    //   return (
    //     <div key={"island0part"+offset} style={{position:'absolute',left:700+offset,top:500}}>
    //     <img style={{maxWidth:70}} src={"island"+island+".png"} />
    //     </div>
    //   )
    // })

    let allIslands = []
    let thisXYOff = [0,0]
    if(this.state.islands){

      for(let id in this.state.islands){
        let offset= 0
        let thisIsland = []
        let iscurrentisland = false
        for(let island in this.state.islands[id].islands){
          let thisIslandSize = parseInt(this.state.islands[id].islands[island])

          if(thisIslandSize){
            const fullViewerSizeMinusPad = 1200
            let left = (parseInt(this.state.islands[id].x)/65535*fullViewerSizeMinusPad+offset)+200
            let top = (parseInt(this.state.islands[id].y)/65535*fullViewerSizeMinusPad)+200


            thisIsland.push(
              <div key={"island"+id+"art"+offset} style={{position:'absolute',left:left,top:top}}>
                <img style={{maxWidth:70}} src={"island"+thisIslandSize+".png"} />
              </div>
            )
            if(island==0){
              if(this.state.islands[id].x==this.state.landX && this.state.islands[id].y==this.state.landY ){
                thisXYOff = [left-document.documentElement.clientWidth/2-200,top-document.documentElement.clientHeight/2-50]
                iscurrentisland=[left+75,top+40]
              }
              thisIsland.push(
                <div key={"island"+id+"art"+offset+"labelarrow"} style={{position:'absolute',left:left+70,top:top+60}}>
                  <img src="arrowformap.png" style={{maxHeight:20,opacity:0.8}} />
                </div>
              )
              thisIsland.push(
                <div key={"island"+id+"art"+offset+"label"} style={{position:'absolute',left:left+78,top:top+55}}>
                  <Writing string={""+this.state.islands[id].x+","+this.state.islands[id].y} size={16}/>
                </div>
              )
            }
            offset+=30
          }
        }
        if(iscurrentisland){
          let coverSize=200
          thisIsland.push(
            <div key={"island"+id+"cover"} style={{position:'absolute',left:iscurrentisland[0]-coverSize/2,top:iscurrentisland[1]-coverSize/2}}>
              <img style={{opacity:0.25,maxWidth:coverSize}} src={"currentisland.png"} />
            </div>
          )
        }

        allIslands.push(
          <div style={{cursor:"pointer"}} onClick={()=>{
            window.location = window.location.protocol+"//"+window.location.hostname+(window.location.port ? ':'+window.location.port: '')+"/"+this.state.islands[id].x+"."+this.state.islands[id].y
          }}>
            {thisIsland}
          </div>
        )
      }
    }

    //add in some filler islands for now
    // /// the land is generated, it's just hard to display so far
    // let fakelocationx
    // let fakelocationy
    // offset = 0
    // fakelocationx = 800
    // fakelocationy = 600
    // let island2 = []
    // offset+=30
    // island2.push(
    //   <div key={"island2art"+offset} style={{position:'absolute',left:fakelocationx+offset,top:fakelocationy}}>
    //   <img style={{maxWidth:70}} src={"island3.png"} />
    //   </div>
    // )
    // offset+=30
    // island2.push(
    //   <div key={"island2art"+offset} style={{position:'absolute',left:fakelocationx+offset,top:fakelocationy}}>
    //   <img style={{maxWidth:70}} src={"island7.png"} />
    //   </div>
    // )
    // offset+=30
    // island2.push(
    //   <div key={"island2art"+offset} style={{position:'absolute',left:fakelocationx+offset,top:fakelocationy}}>
    //   <img style={{maxWidth:70}} src={"island2.png"} />
    //   </div>
    // )


    let startingPercent = STARTINGGWEI / MAXGWEI
    let startingPixels = startingPercent*100
    let rightSideRoom = 100-startingPixels
    let gasOffset = 25;
    let gasDragger = (
      <div>

      <div style={{position:'absolute',left:182+gasOffset,top:105,opacity:this.state.gweiOpacity*2/3}}>
      <Writing string={"cheap"} size={12}/>
      </div>
      <div style={{position:'absolute',left:212+gasOffset,top:110,opacity:this.state.gweiOpacity}}>
      <Writing string={this.state.GWEI+" gwei"} size={16}/>
      </div>
      <div style={{position:'absolute',left:270+gasOffset,top:105,opacity:this.state.gweiOpacity*2/3}}>
      <Writing string={"fast"} size={12}/>
      </div>
      <div style={{
        width:100,
        height:9,
        backgroundImage:"url('gasbar.png')",
        position:"absolute",left:190+gasOffset,top:92,opacity:this.state.gweiOpacity*1.6
      }}></div>
      <Draggable axis="x" bounds={{left:startingPixels*-1,right:rightSideRoom}}
      onDrag={this.handleWhiskeyDrag.bind(this)}
      onStart={this.handleWhiskeyStart.bind(this)}
      onStop={this.handleWhiskeyStop.bind(this)}
      >
      <div style={{
        width:25,
        height:35,
        backgroundImage:"url('whiskeystrength.png')",
        position:"absolute",left:177+startingPixels+gasOffset,top:77
      }}></div>
      </Draggable>
      </div>
    )

    let iconOffset = 2;

    //        overflow:currentStyles.overflow,
    //
    let fullMap
    let fullViewerSize = 6500
    if(!this.state.mapUp){
      fullMap=""
      fullViewerSize=1
    }else{
      fullMap = (
        <div style={{
          width:6500,
          height:6500,
          /*transform:"scale("+this.state.mapScale+")",*/
        }}>
        <Draggable bounds={{right:300,left:-6200,bottom:100,top:-6400}} defaultPosition={{x: -thisXYOff[0], y: -thisXYOff[1]}} >

        <div style={{
          width:6500,
          height:6500,
          position:'relative',
          left:-300,
          top:-100,
          backgroundImage:"url('maptexturelightfaded.jpg')",
        }}>

        {allIslands}

        </div>

        </Draggable>
        </div>
      )
    }

    let decentralizedLink = "https://ipfs.io/ipfs/"+IPFSADDRESS;
    if(window.location.href.indexOf("ipfs")>=0){
      decentralizedLink = "https://galleass.io";
    }

    let mapZ = 300
    if(this.state.mapUp){
      mapZ = 750
    }

    let galleassRight = currentStyles.titleRight+((1-this.state.zoom)*120)
    let galleassBottom = currentStyles.titleBottom+((1-this.state.zoom)*54)

    //margins marginBottom:-20,marginRight:-10
    //width:300,transform:"scale("+this.state.zoom+")",cursor:"pointer",zIndex:2,
    //
    let adjustedMenuZoom = Math.min(1,this.state.zoom * 1.5)
    //
    //
    //
    //

    let coords = ""
    if(this.state.landY&&this.state.landX){
      coords = (
        <div style={{position:"absolute",top:62,left:-9,width:300}}>
          <Writing  string={"@ "+this.state.landX+","+this.state.landY} size={20}/>
        </div>
      )
    }

    return (

      <div style={{
        position:'fixed',
        right:currentStyles.right,
        bottom:currentStyles.bottom,
        width:this.state.clientWidth,
        height:this.state.clientHeight,
        zIndex:mapZ,
      }}>

      <div style={{
        width:fullViewerSize,
        height:fullViewerSize,
      }} onWheel = {this.mapWheel.bind(this)}>

      {fullMap}




      <div style={{position:'absolute',opacity:this.state.cornerOpacity,left:0,top:0}}>
      <img style={{maxWidth:(this.state.clientWidth/5)}} src={"topleftcorner.png"} />
      </div>
      <div style={{position:'absolute',opacity:this.state.cornerOpacity,right:0,top:0}}>
      <img style={{maxWidth:(this.state.clientWidth/5)}} src={"toprightcorner.png"} />
      </div>


      <div style={{transform:"scale("+this.state.zoom+")",cursor:"pointer",zIndex:2,position:'absolute',opacity:this.state.cornerOpacity,right:0-((1-this.state.zoom)*90),bottom:-4-((1-this.state.zoom)*84)}} onClick={this.titleClick.bind(this)}>
      <img src={"corner.png"} />
      </div>



      <div style={{cursor:"pointer",zIndex:1,position:'fixed',opacity:1-this.state.cornerOpacity,top:currentStyles.titleBottomFaster-20,left:-20}} >


      <div style={{zIndex:mapZ,transform:"scale("+adjustedMenuZoom+")",marginLeft:-((1-adjustedMenuZoom)*175),marginTop:-((1-adjustedMenuZoom)*60)}}>
        <div style={{position:'relative',backgroundImage:"url('mapicon.png')",width:400,height:115}} onClick={this.titleClick.bind(this)}>
          <div style={{position:"absolute",top:15,left:24}}>
            <Writing  string={"Galleass.io"} size={50} space={5} letterSpacing={20}/>
          </div>
          {coords}
        </div>
        <a href="https://github.com/austintgriffith/galleass" target="_blank">
        <img data-rh="Source" data-rh-at="bottom" style={{maxHeight:36,position:"absolute",left:25+iconOffset,top:83,opacity:0.8}} src="github.png" />
        </a>
        <a href="http://austingriffith.com/portfolio/galleass/" target="_blank">
        <img data-rh="Info" data-rh-at="bottom" style={{maxHeight:36,position:"absolute",left:70+iconOffset,top:83,opacity:0.8}} src="moreinfo.png" />
        </a>
        <a href="contracts.html" target="_blank">
        <img data-rh="Contracts" data-rh-at="bottom"  style={{maxHeight:36,position:"absolute",left:115+iconOffset,top:83,opacity:0.8}} src="smartcontract.png" />
        </a>
        <a href={decentralizedLink} target="_blank">
        <img data-rh="IPFS" data-rh-at="bottom" style={{maxHeight:36,position:"absolute",left:160+iconOffset,top:83,opacity:0.8}} src="ipfs.png" />
        </a>
        {gasDragger}


      </div>


      </div>
      <div style={{position:'absolute',opacity:this.state.cornerOpacity,left:10,bottom:10}} onClick={this.titleClick.bind(this)}>
      <img src={"compass.png"} style={{maxWidth:60}} />
      </div>



      </div>



      <Social cornerOpacity={this.state.cornerOpacity} zoom={this.state.zoom} />


      <div style={{zIndex:1,position:'fixed',right:60,bottom:-4,opacity:0}} onClick={this.testSomething.bind(this)}>
      <img style={{maxHeight:36,opacity:0.7}} src="moreinfo.png" />
      </div>


      </div>

    )

  }}
  </Motion>

  <Motion
  defaultStyle={{
    scrollLeft:document.scrollingElement.scrollLeft
  }}
  style={{
    zoom:this.state.zoom,
    scrollLeft: spring(this.state.scrollLeft,this.state.scrollConfig )// presets.noWobble)
  }}
  >
  {currentStyles => {
    //console.log("currentStyles.scrollLeft",currentStyles.scrollLeft)
    return <WindowScrollSink scrollLeft={currentStyles.scrollLeft} />
    //*this.state.zoom
  }}
  </Motion>



  <BottomBar
  bottomBar={this.state.bottomBar}
  zoom={this.state.zoom}
  clientWidth={this.state.clientWidth}
  bottomBarMessage={this.state.bottomBarMessage}
  bottomBarSize={this.state.bottomBarSize}
  />



  <Motion
  defaultStyle={{
    top:-500
  }}
  style={{
    top:spring(this.state.modalHeight,{ stiffness: 100, damping: 10 })
  }}
  >
  {currentStyles => {
    //<div style={{zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top,textAlign:"center",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>

    let largerModalThanZoom = Math.min(this.state.zoom*1.27,1)

    if(this.state.modalObject.loading){
      return (
        <div style={{transform:"scale("+largerModalThanZoom+")",zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top-((1-largerModalThanZoom)*300),textAlign:"center",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>
        <div style={{cursor:'pointer',position:'absolute',right:24,top:24}} onClick={this.clickScreenClick.bind(this)}>
        <img src="exit.png" />
        </div>
        <div style={{paddingBottom:100}}></div>
        <div><img style={{
          zIndex:-99,
          opacity:0.5,
        }} src="loading3.gif" /></div>

        </div>
      )
    } else if(this.state.modalObject.simpleMessage){
      return (
        <div style={{transform:"scale("+largerModalThanZoom+")",zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top-((1-largerModalThanZoom)*300),textAlign:"center",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>
        <div style={{cursor:'pointer',position:'absolute',right:24,top:24}} onClick={this.clickScreenClick.bind(this)}>
        <img src="exit.png" />
        </div>
        <div style={{paddingBottom:100}}></div>
        <div><Writing style={{opacity:0.9}} string={this.state.modalObject.simpleMessage} size={22}/></div>
        <div><Writing style={{opacity:0.9}} string={this.state.modalObject.simpleMessage2} size={22}/></div>
        <div><Writing style={{opacity:0.9}} string={this.state.modalObject.simpleMessage3} size={22}/></div>

        </div>
      )
    }else if(this.state.modalObject.message){
      return (
        <div style={{transform:"scale("+largerModalThanZoom+")",zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top-((1-largerModalThanZoom)*300),textAlign:"left",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>
          <div style={{cursor:'pointer',position:'absolute',right:24,top:24}} onClick={this.clickScreenClick.bind(this)}>
            <img src="exit.png" />
          </div>
          {Message(this.state.modalObject)}
        </div>
      )
    }else{

      let image = this.state.modalObject.name.toLowerCase()+".png"


      let content = []

      content.push(
        <div style={{padding:60}}>
        </div>
      )

      if(this.state.modalObject.wallet){

        return (
          <div style={{transform:"scale("+largerModalThanZoom+")",zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top-((1-largerModalThanZoom)*300),textAlign:"center",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>
            <div style={{cursor:'pointer',position:'absolute',right:24,top:24}} onClick={this.clickScreenClick.bind(this)}>
            <img src="exit.png" />
            </div>
            <Wallet
              modalObject={this.state.modalObject}
              account={this.state.account}
              etherscan={this.state.etherscan}
              sendEth={this.sendEth.bind(this)}
            />
          </div>
        )

      }else if(this.state.modalObject.token){

        let body
        if(this.state.modalObject.tokensOfOwner){

          //console.log("TOKENSOFOWNER",this.state.modalObject.tokensOfOwner,this.state.modalObject.tokens)
          let allTokens

          if(this.state.modalObject.name=="Citizens"){
            allTokens = this.state.modalObject.tokensOfOwner.map((id)=>{
              //"head":"341","hair":"54678","eyes":"11577","nose":"47392","mouth":
              return (
                <div>
                <Citizen size={50} id={id} web3={web3}
                setCitizenPrice={this.setCitizenPrice.bind(this)}
                moveCitizen={this.moveCitizen.bind(this)}
                genes={this.state.modalObject.tokens[id].geneObject}
                status={this.state.modalObject.tokens[id].status}
                data={this.state.modalObject.tokens[id].data}
                x={this.state.modalObject.tokens[id].x}
                y={this.state.modalObject.tokens[id].y}
                tile={this.state.modalObject.tokens[id].tile}
                characteristics={this.state.modalObject.tokens[id].characteristicsObject}
                />
                </div>
              )
            })
          }else if(this.state.modalObject.name=="Dogger"){
            allTokens = this.state.modalObject.tokensOfOwner.map((id)=>{
              return (
                <div>
                <Dogger id={id} {...this.state.modalObject.tokens[id]} embark={this.embark.bind(this)}/>
                </div>
              )
            })
          }else{
            allTokens = this.state.modalObject.tokensOfOwner.map((token)=>{
              return (
                <div>
                other NFT token stuff
                </div>
              )
            })
          }

          body = (
            <div style={{marginTop:100}}>
            {allTokens}
            </div>
          )
        }else{
          body = (
            <div style={{marginTop:100}}>
            <SendToken
            modalObject={this.state.modalObject}
            sendToken={this.sendToken.bind(this)}
            sellFish={(fishSellAmount)=>{
              console.log("SELLFISH",this.state.landX,this.state.landY,this.state.fishmongerIndex,this.state.modalObject.name,fishSellAmount)
              this.sellFish(this.state.landX,this.state.landY,this.state.fishmongerIndex,this.state.modalObject.name,fishSellAmount)
            }}
            />
            </div>
          )
        }

        //<div style={{zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top,textAlign:"center",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>
        return (
          <div style={{transform:"scale("+largerModalThanZoom+")",zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top-((1-largerModalThanZoom)*300),textAlign:"center",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>
          <div style={{cursor:'pointer',position:'absolute',right:24,top:24}} onClick={this.clickScreenClick.bind(this)}>
          <img src="exit.png" />
          </div>
          <div style={{position:'absolute',left:24,top:24,border:"3px solid #777777"}}>
          <img style={{maxWidth:83,maxHeight:83}} src={image}/>
          </div>
          <div style={{position:'absolute',left:118,top:24,textAlign:"left"}}>
          <div> <Writing style={{opacity:0.9}} string={this.state.modalObject.balance+" "+this.state.modalObject.name} size={28}/></div>
          <div>Contract: <a target="_blank" href={this.state.etherscan+"address/"+this.state.modalObject.contract}>{this.state.modalObject.contract}</a></div>
          </div>
          {body}
          </div>
        )
      }else{

        if(this.state.modalObject.name.indexOf("Resource")>=0){
          image = this.state.modalObject.name.split("Resource").join("");
          image = image.split(" ").join("");
          if(image) image = image.toLowerCase()+"tile.png"
        }else if(this.state.modalObject.name.indexOf("Stream")>=0){
          image = "blank_stream.png"
        }else if(this.state.modalObject.name.indexOf("Grass")>=0){
          image = "blank_hills.png"
        }else if(this.state.modalObject.name.indexOf("Hills")>=0){
          image = "blank_grass.png"
        }else if(this.state.modalObject.name.indexOf("Timber Camp")>=0){
          image = "timbercamptile.png"
        }

        const OWNS_TILE = (this.state.account && this.state.modalObject.owner && this.state.account.toLowerCase()==this.state.modalObject.owner.toLowerCase())

        const invHeight = 20

        const modalInvStyle = {
          marginRight:invHeight
        }

        let citizensHere = []
        if(this.state.modalObject.citizens){
          let count = 0
          citizensHere = this.state.modalObject.citizens.map((c)=>{
            return (
              <CitizenFace size={35} offset={count++} padding={6} genes={c.geneObject} owner={c.owner}/>
            )
          })
        }
        content.push(
          <div style={{position:'absolute',left:20,bottom:100}}>
          {citizensHere}
          </div>
        )

        let inventoryItems = []
        if(this.state.modalObject.balance>0){
          inventoryItems.push(
            <span style={modalInvStyle}><img style={{maxHeight:invHeight}} src="ether.png" />
            <Writing string={Math.round(web3.utils.fromWei(this.state.modalObject.balance,'ether')*10000)/10000} size={invHeight+2}/>
            </span>
          )
        }
        //new method of looking at token balance in a contract
        if(this.state.modalObject.tokenBalance){
          for(let i in inventoryTokens){
            if(this.state.modalObject.tokenBalance[inventoryTokens[i]]>0){
              inventoryItems.push(
                <span style={modalInvStyle}><img style={{maxHeight:invHeight}} src={inventoryTokens[i].toLowerCase()+".png"} />
                <Writing string={this.state.modalObject.tokenBalance[inventoryTokens[i]]} size={invHeight+2}/>
                </span>
              )
            }
          }
        }

        /*
        if(this.state.modalObject.doggerBalance>0){
        inventoryItems.push(
        <span style={modalInvStyle}><img style={{maxHeight:invHeight}} src="dogger.png" />
        <Writing string={this.state.modalObject.doggerBalance} size={invHeight+2}/>
        </span>
      )
    }

    if(this.state.modalObject.copperBalance>0){
    inventoryItems.push(
    <span style={modalInvStyle}><img style={{maxHeight:invHeight}} src="copper.png" />
    <Writing string={this.state.modalObject.copperBalance} size={invHeight+2}/>
    </span>
  )
}
if(this.state.modalObject.filletBalance>0){
inventoryItems.push(
<span style={modalInvStyle}><img style={{maxHeight:invHeight}} src="fillet.png" />
<Writing string={this.state.modalObject.filletBalance} size={invHeight+2}/>
</span>
)
}
if(this.state.modalObject.timberBalance>0){
inventoryItems.push(
<span style={modalInvStyle}><img style={{maxHeight:invHeight}} src="timber.png" />
<Writing string={this.state.modalObject.timberBalance} size={invHeight+2}/>
</span>
)
}*/
content.push(
  <div style={{position:'absolute',left:20,bottom:50}}>
  {inventoryItems}
  </div>
)

if(OWNS_TILE && this.state.modalObject.name == "Grass"){
  let tileIndex = this.state.modalObject.index;
  content.push(
    <div>
    <BuildTable tileIndex={tileIndex} clickFn={this.buildTile.bind(this)}/>
    </div>
  )
}


/*

TODO

still trying to nail down what I want these to look like

I think I want modal components to have two sides, a loader and a display

the loader will be like a module that will get all the data prepared in the modal object

then the display will just take in the the modal object and display (this will be a component like in the modal folder )

I keep running into all these different things like landx landy OWNS_TILE that need to be passed in as props
those should all be in the modal object on the way in so this stuff below is cleaner

but there are also functions that should probably be built into the modal instead of the app
I think the problem there was gwei var or something, but that could be injected into the modalobject too


*/


if(this.state.modalObject.name == "Harbor"){
  content.push(
    <Harbor
    {...this.state.modalObject}
    buyShip={this.buyShip.bind(this)}
    buySchooner={this.buySchooner.bind(this)}
    disembark={this.disembark.bind(this)}
    embark={this.embark.bind(this,false)}
    />
  )
}
if(this.state.modalObject.name == "Fishmonger"){
  content.push(
    <Fishmonger
    readContracts={readContracts}
    {...this.state.modalObject}
    sellFish={this.sellFish.bind(this)}
    transferAndCall={this.transferAndCall.bind(this)}
    />
  )
}
if(this.state.modalObject.name == "Market"){
  content.push(
    <Market
    readContracts={readContracts}
    {...this.state.modalObject}
    transferAndCall={this.transferAndCall.bind(this)}
    />
  )
}

if(OWNS_TILE && this.state.modalObject.name == "Village"){
  let tileIndex = this.state.modalObject.index;
  content.push(
    <div style={{marginTop:0,cursor:"pointer",position:'absolute',left:22,height:0}}>
      <img src="buildCastle.png" data-rh-at="right" data-rh={"Use 20 Stone to build a Castle"}
        onClick={this.buildTile.bind(this,tileIndex,2010)}
      />
    </div>
  )
  content.push(
    <div>
      <CreateCitizens createCitizen={(food1,food2,food3)=>{
        console.log("CREATE CITIZEN!",food1,food2,food3)
        this.createCitizen(this.state.landX,this.state.landY,this.state.modalObject.index,food1,food2,food3)
      }}/>
    </div>
  )

}else if(OWNS_TILE && this.state.modalObject.name == "Castle"){
  let tileIndex = this.state.modalObject.index;

  content.push(
    <div>
      <CreateCitizens createCitizen={(food1,food2,food3)=>{
        console.log("CREATE CITIZEN!",food1,food2,food3)
        this.createCitizen(this.state.landX,this.state.landY,this.state.modalObject.index,food1,food2,food3)
      }}/>
    </div>
  )

}else if(OWNS_TILE && this.state.modalObject.name == "Mountain Resource"){
  let citizen = false
  if(this.state.modalObject.citizens[0]){
    citizen = this.state.modalObject.citizens[0].id
  }
  content.push(
    <MountainTile
    modalObject={this.state.modalObject}
    extractRawResource={this.extractRawResource.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,4)}
  //  buildTimberCamp={this.buildTimberCamp.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,citizen)}
    />
  )
}else if(OWNS_TILE && this.state.modalObject.name == "Forest Resource"){
  let citizen = false
  if(this.state.modalObject.citizens[0]){
    citizen = this.state.modalObject.citizens[0].id
  }
  content.push(
    <ForestTile
    modalObject={this.state.modalObject}
    extractRawResource={this.extractRawResource.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,3)}
    buildTimberCamp={this.buildTimberCamp.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,citizen)}
    />
  )
}else if(OWNS_TILE && this.state.modalObject.name == "Grass Resource"){
  let citizen = false
  if(this.state.modalObject.citizens[0]){
    citizen = this.state.modalObject.citizens[0].id
  }
  content.push(
    <GrassTile
    modalObject={this.state.modalObject}
    extractRawResource={this.extractRawResource.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,2)}
    />
  )
}else if(OWNS_TILE && this.state.modalObject.name == "Timber Camp"){
  let tileIndex = this.state.modalObject.index;
  content.push(
    <div>
    <ResourceTable
    extractRawResource={this.extractRawResource.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,3)}
    collect={(e)=>{
      this.collect("TimberCamp",this.state.modalObject.index)
      e.preventDefault()
      e.stopPropagation()
      return false
    }} {...this.state.modalObject} web3={web3} blockNumber={this.state.blockNumber}
    />
    </div>
  )
}

//  <div>Price: {this.state.modalObject.price}</div>
//
let tilePriceAndPurchase = ""
if(OWNS_TILE){
  tilePriceAndPurchase = (
    <div style={{float:'right',padding:10,marginRight:-100}}>
    <Writing style={{verticalAlign:'middle',opacity:0.9}} string={"Sale Price: "} size={20}/>
    <input style={{textAlign:'right',width:40,marginRight:3,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}} type="text" name="landPurchasePrice" value={this.state.modalObject.price} onFocus={this.handleFocus} onChange={this.handleModalInput.bind(this)}/>
    <img  style={{verticalAlign:'middle',maxHeight:20}} src="copper.png" />
    <img data-rh={"Offer to sell land for "+this.state.modalObject.price+" Copper"} data-rh-at="right"
    src="metamasksign.png"
    style={{verticalAlign:'middle',maxHeight:20,marginLeft:10,cursor:"pointer"}} onClick={this.setLandPrice.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,this.state.modalObject.price)}
    />
    </div>
  )
}else if(this.state.modalObject.price>0){
  tilePriceAndPurchase = (
    <div style={{float:'right',padding:10}}>
    <Writing style={{opacity:0.9}} string={"Purchase Land: "+this.state.modalObject.price+" "} size={20}/>
    <img  style={{maxHeight:20}} src="copper.png" />
    <img data-rh={"Purchase land for  "+this.state.modalObject.price+" Copper"} data-rh-at="right"
    src="metamasksign.png"
    style={{maxHeight:20,marginLeft:10,cursor:"pointer"}} onClick={this.buyLand.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,this.state.modalObject.price)}
    />
    </div>
  )
}else if(this.state.modalObject.owner=="0x0000000000000000000000000000000000000000"){
  tilePriceAndPurchase = (
    <div style={{float:'right',padding:10}}>
    <Writing style={{opacity:0.9}} string={"Claim Land: "+this.state.modalObject.claimPrice+" "} size={20}/>
    <img  style={{maxHeight:20}} src="copper.png" />
    <img data-rh={"Claim land for  "+this.state.modalObject.claimPrice+" Copper"} data-rh-at="right"
    src="metamasksign.png"
    style={{maxHeight:20,marginLeft:10,cursor:"pointer"}} onClick={this.buyLand.bind(this,this.state.landX,this.state.landY,this.state.modalObject.index,this.state.modalObject.claimPrice)}
    />
    </div>
  )
}

let contractAddress = ""
if(this.state.modalObject.contract&&this.state.modalObject.contract!="0x0000000000000000000000000000000000000000"){
  contractAddress = (
    <div>Contract: <a target="_blank" href={this.state.etherscan+"address/"+this.state.modalObject.contract}>{this.state.modalObject.contract}</a></div>
  )
}

return (
  <div style={{transform:"scale("+largerModalThanZoom+")",zIndex:999,position:'fixed',left:this.state.clientWidth/2-350,paddingTop:30,top:currentStyles.top-((1-largerModalThanZoom)*300),textAlign:"center",opacity:1,backgroundImage:"url('modal_smaller.png')",backgroundRepeat:'no-repeat',height:500,width:700}}>
  <div style={{cursor:'pointer',position:'absolute',right:24,top:24}} onClick={this.clickScreenClick.bind(this)}>
  <img src="exit.png" />
  </div>
  <div style={{position:'absolute',left:24,top:24,border:"3px solid #777777"}}>
  <img style={{maxWidth:83}} src={image}/>
  </div>
  <div style={{position:'absolute',left:118,top:24,textAlign:"left"}}>
  <div><Writing style={{opacity:0.9}} string={this.state.modalObject.name} size={28}/>  -  {this.state.modalObject.index} @ ({this.state.landX},{this.state.landY})</div>
  {contractAddress}
  <div>Owner: <a target="_blank" href={this.state.etherscan+"address/"+this.state.modalObject.owner}>{this.state.modalObject.owner}</a></div>
  {tilePriceAndPurchase}
  </div>
  {content}
  </div>
)
}


}


}}
</Motion>
<img src="maptexturelightfaded.jpg" style={{position:'absolute',width:1,height:1,left:1,top:1}} />
</div>
);
}
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const DEBUGCONTRACTLOAD = false;
let loadContract = async (contract,theThis)=>{
  try{
    if(DEBUGCONTRACTLOAD) console.log("HITTING readContracts GALLEASS for address of "+contract)
    if(DEBUGCONTRACTLOAD) console.log(contracts["Galleass"])
    let hexContractName = web3.utils.asciiToHex(contract);
    if(DEBUGCONTRACTLOAD) console.log(hexContractName)

    if(!readContracts["Galleass"]){
      if(DEBUGCONTRACTLOAD) console.log("NOW GRAB READ GALLEASS CONTRACT...")
      readContracts["Galleass"] = new xdaiweb3.eth.Contract(require('./Galleass.abi.js'),galleassAddress)
      if(DEBUGCONTRACTLOAD) console.log("GALLEASS CONTRACT LOADED")
    }

    let thisContractAddress = await readContracts["Galleass"].methods.getContract(hexContractName).call()
    thisContractAddress = thisContractAddress.toLowerCase() //this is needed for metamask to get events !?!
    console.log("CONTRACT",contract,thisContractAddress)
    if(DEBUGCONTRACTLOAD) console.log("ADDRESS:",thisContractAddress)
    let thisContractAbi = require('./'+contract+'.abi.js');
    if(DEBUGCONTRACTLOAD) console.log("LOADING",contract,thisContractAddress,thisContractAbi)
    contracts[contract] = new web3.eth.Contract(thisContractAbi,thisContractAddress)
    readContracts[contract] = new xdaiweb3.eth.Contract(thisContractAbi,thisContractAddress)
  } catch(e) {
    console.log("ERROR LOADING "+contract,e)
    //go ahead and show things...
    theThis.setState({readyToDisplay:true})

  }

}

let waitInterval
function waitForAllContracts(){
  const CONTRACTLOADDEBUG = false;
  if(CONTRACTLOADDEBUG) console.log("waitForAllContracts")
  let finishedLoading = true;
  for(let c in loadContracts){
    if(!contracts[loadContracts[c]]) {
      finishedLoading=false;
      if(CONTRACTLOADDEBUG) console.log(loadContracts[c]+" is still loadin")
    }
  }
  if(finishedLoading&&this.state&&this.state.blockNumber) {
    this.startEventSync()
    this.loadIpfs()
  }
}

function mergeByTimestamp(a,b) {
  for(let i in a) {
    if(a[i]&&b[i]&& a[i].timestamp && b[i].timestamp){
      if(parseInt(a[i].timestamp)>parseInt(b[i].timestamp)){
        b[i] = a[i];
      }else{
        a[i] = b[i];
      }
    }else{
      b[i] = a[i];
    }
  }
  return b;
}

function hasElements(a){
  for(let i in a) {
    return true;
  }
  return false;
}

function isEquivalentAndNotEmpty(a, b) {
  if((!a||!b)&&(a||b)) {
    //console.log("something is blank")
    return false;
  }
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);
  if (aProps.length != bProps.length) {
    //console.log("prop length is a different ")
    return false;
  }
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName]) {
      //  console.log("prop"+propName+" changed")
      return false;
    }
  }
  return true;
}

class WindowScrollSink extends Component {
  componentDidUpdate (prevProps) {
    if (prevProps.scrollLeft !== this.props.scrollLeft) {
      document.scrollingElement.scrollLeft = this.props.scrollLeft
    }
  }
  render () {
    return null
  }
}

var toUtf8 = function(hex) {
  var buf = new Buffer(hex.replace('0x',''),'hex');
  return buf.toString();
}

const promisify = (inner) =>
new Promise((resolve, reject) =>
inner((err, res) => {
  if (err) { reject(err) }

  resolve(res);
})
);

export default App;
