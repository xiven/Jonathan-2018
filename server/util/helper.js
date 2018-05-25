const crypto = require('crypto');
const secp256k1 = require('secp256k1');

//helper functions
digest = (str, algo = "sha256") => {
    return crypto.createHash(algo).update(str).digest();
}
  
generateKeys = (user) => {
    let privateKey;
    do {
        privateKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    // get the public key in a compressed format
    const publicKey = secp256k1.publicKeyCreate(privateKey);

    return keyPair = { userId: user._id, pubKey: publicKey, pvtKey: privateKey };
}

module.exports = {
    digest,
    generateKeys
}