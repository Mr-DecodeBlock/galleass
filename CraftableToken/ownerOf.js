//
// usage: clevis contract ownerOf CraftableToken
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.ownerOf(args[3]).call()
  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
