//
// usage: clevis contract build Galleass ##accountindex## 
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running build() as account ["+params.accounts[args[3]]+"]")
  return contract.methods.build().send({
    from: params.accounts[args[3]],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
