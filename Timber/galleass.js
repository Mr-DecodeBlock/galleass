//
// usage: clevis contract galleass Timber
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.galleass().call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
