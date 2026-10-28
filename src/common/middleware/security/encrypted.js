import crypto from "node:crypto"

const Encryption_Key=Buffer.from("123457oiahluf!@#kioy7237toQJJKKD")
const IV_LENGHT=16;

export function Encrypt(plainText){
    const iv = crypto.randomBytes(IV_LENGHT);
    const cipher= crypto.createCipheriv('aes-256-cbc',Encryption_Key,iv);
    let encrypted=cipher.update(plainText,'utf8','hex')
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted
}
export function Decrypt(ciphertext){
    const [ivHex,encryptedPlainText] = ciphertext.split(':') ;
    const iv = Buffer.from(ivHex,'hex');
    const decipher=crypto.createDecipheriv('aes-256-cbc',Encryption_Key,iv)
    let decrypted= decipher.update(encryptedPlainText,'hex','utf8')
    decrypted += decipher.final('utf8')
    return decrypted;
}
