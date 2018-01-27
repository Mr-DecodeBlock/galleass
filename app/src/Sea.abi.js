module.exports = [{"constant":false,"inputs":[{"name":"_fish","type":"bytes32"},{"name":"_bait","type":"bytes32"}],"name":"reelIn","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_account","type":"address"}],"name":"inRangeToDisembark","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"dropAnchor","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"galleass","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"ships","outputs":[{"name":"id","type":"uint256"},{"name":"floating","type":"bool"},{"name":"sailing","type":"bool"},{"name":"direction","type":"bool"},{"name":"fishing","type":"bool"},{"name":"blockNumber","type":"uint32"},{"name":"location","type":"uint16"},{"name":"bait","type":"bytes32"},{"name":"fish","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"shipId","type":"uint256"}],"name":"disembark","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"depth","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"direction","type":"bool"}],"name":"setSail","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_species","type":"address"}],"name":"allowSpecies","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_location","type":"uint16"},{"name":"_speed","type":"uint8"},{"name":"_image","type":"uint8"}],"name":"addCloud","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_species","type":"address"},{"name":"_amount","type":"uint256"}],"name":"stock","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"baitHash","type":"bytes32"}],"name":"castLine","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"width","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"reclaimEther","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_contract","type":"address"},{"name":"_permission","type":"bytes32"}],"name":"hasPermission","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"shipSpeed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getHarborLocation","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"bytes32"}],"name":"fishLocation","outputs":[{"name":"","type":"uint16"},{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"fish","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_address","type":"address"}],"name":"getShip","outputs":[{"name":"id","type":"uint256"},{"name":"floating","type":"bool"},{"name":"sailing","type":"bool"},{"name":"direction","type":"bool"},{"name":"fishing","type":"bool"},{"name":"blockNumber","type":"uint32"},{"name":"location","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"shipLocation","outputs":[{"name":"","type":"uint16"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"species","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"getContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"shipId","type":"uint256"}],"name":"embark","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_galleass","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"owner","type":"address"},{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"floating","type":"bool"},{"indexed":false,"name":"sailing","type":"bool"},{"indexed":false,"name":"direction","type":"bool"},{"indexed":false,"name":"fishing","type":"bool"},{"indexed":false,"name":"blockNumber","type":"uint32"},{"indexed":false,"name":"location","type":"uint16"}],"name":"ShipUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"location","type":"uint16"},{"indexed":false,"name":"speed","type":"uint8"},{"indexed":false,"name":"image","type":"uint8"},{"indexed":false,"name":"block","type":"uint32"}],"name":"Cloud","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"id","type":"bytes32"},{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"species","type":"address"},{"indexed":false,"name":"image","type":"bytes32"}],"name":"Fish","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"},{"indexed":false,"name":"id","type":"bytes32"},{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"species","type":"address"}],"name":"Catch","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"},{"indexed":false,"name":"randomishWidthNumber","type":"uint256"},{"indexed":false,"name":"randomishDepthNumber","type":"uint256"},{"indexed":false,"name":"fishx","type":"uint16"},{"indexed":false,"name":"fishy","type":"uint16"},{"indexed":false,"name":"distanceToFish","type":"uint16"},{"indexed":false,"name":"result","type":"bool"}],"name":"Attempt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}]