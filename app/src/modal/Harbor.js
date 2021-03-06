import React, { Component } from 'react';
import Writing from '../Writing.js'
import BuySellTable from './BuySellTable.js'

class Harbor extends Component {
  async buildShip(x,y,i,modelName){
    let {web3,contracts,GWEI} = this.props
    console.log("BUILD DOGGER ",x,y,i)
    const accounts = await promisify(cb => web3.eth.getAccounts(cb));



    let xHex = parseInt(x).toString(16)
    while(xHex.length<4) xHex="0"+xHex;
    let yHex = parseInt(y).toString(16)
    while(yHex.length<4) yHex="0"+yHex;
    let iHex = parseInt(i).toString(16)
    while(iHex.length<2) iHex="0"+iHex;

    let model = web3.utils.fromAscii(modelName)
    model=model.replace("0x","")
    while(model.length%2!=0) model="0"+model;

    let data = "0x01"+xHex+yHex+iHex+model
    let price = await contracts[modelName].methods.TIMBERTOBUILD().call()
    console.log("price:",price)
    console.log("Final data:",data)

    contracts["Timber"].methods.transferAndCall(contracts["Harbor"]._address,price,data).send({
      from: accounts[0],
      gas:1000000,
      gasPrice:Math.round(GWEI * 1000000000)
    },(error,hash)=>{
      console.log("CALLBACK!",error,hash)
      this.props.startWaiting(hash)
    }).on('error',this.props.transactionError)
    .on('transactionHash',this.props.transactionHash)
    .on('receipt',this.props.transactionReceipt)
    .on('confirmation', this.props.transactionConfirmation).then((receipt)=>{
      console.log("~~~~~BUILD SHIP RESULT:",receipt)
    })

    // contracts["Timber"].methods.transferAndCall(contracts["Harbor"]._address,doggerPrice,data).send({
    //   from: accounts[0],
    //   gas:500000,
    //   gasPrice:Math.round(GWEI * 1000000000)
    // }, function(error, transactionHash){
    //   console.log("~~~~~~~~ CALLBACK",error,transactionHash)
    // })
    // .on('error', function(error){
    //   console.log("~~~~~~~~ ERROR",error)
    // })
    // .on('transactionHash', function(transactionHash){
    //   console.log("~~~~~~~~ transactionHash",transactionHash)
    // })
    // .on('receipt', function(receipt){
    //    console.log("~~~~~~~~ receipt",receipt,receipt.contractAddress) // contains the new contract address
    // })
    // .on('confirmation', function(confirmationNumber, receipt){
    //   console.log("~~~~~~~~ confirmation",confirmationNumber,receipt)
    // })
    // .then(function(a,b,c){
    //     console.log("~~~~~~~~ .THEN",a,b,c) // instance with the new contract address
    // });
  }

  render(){

    let content = []

    let {web3,landX,landY,index,doggers,doggerPrice,schooners,schoonerPrice,buyShip,buySchooner,buildShip,ownsTile,embark,disembark} = this.props

    let buyArray = [{
      amount: "1",
      balance: doggers,
      first:"dogger",
      price: web3.utils.fromWei(""+doggerPrice,'ether'),
      second:"ether",
      clickFn: buyShip,
    },{
      amount: "1",
      balance: schooners,
      first:"schooner",
      price: schoonerPrice,
      second:"copper",
      clickFn: buySchooner,
    }]
    let sellArray = []
    content.push(
      <BuySellTable key="buyselltable" buyArray={buyArray} sellArray={sellArray}/>
    )
    if(ownsTile){
      content.push(
        <div key="buildDogger" style={{position:"absolute",left:250,top:105,cursor:"pointer"}}
          onClick={this.buildShip.bind(this,landX,landY,index,"Dogger")}>
          <img style={{maxHeight:50,maxWidth:50}} src={"buildDogger.png"} />
        </div>
      )
      content.push(
        <div key="buildSchooner" style={{position:"absolute",left:310,top:105,cursor:"pointer"}}
          onClick={this.buildShip.bind(this,landX,landY,index,"Schooner")}>
          <img style={{maxHeight:50,maxWidth:50}} src={"buildSchooner.png"} />
        </div>
      )

    }
    content.push(
      <div key="embark" style={{position:"absolute",left:130,top:105,cursor:"pointer"}} onClick={embark}>
        <img style={{maxHeight:50,maxWidth:50}} src={"approveAndEmbark.png"} />
      </div>
    )
    content.push(
      <div key="disembark" style={{position:"absolute",left:190,top:105,cursor:"pointer"}} onClick={disembark}>
        <img style={{maxHeight:50,maxWidth:50}} src={"disembark.png"} />
      </div>
    )

    return (
      <div>
        {content}
      </div>
    )
  }
}


const promisify = (inner) =>
new Promise((resolve, reject) =>
inner((err, res) => {
  if (err) { reject(err) }
  resolve(res);
})
);


export default Harbor;
