import { Injectable } from '@nestjs/common';
import {
  Cipher,
  CipherKey,
  createCipheriv,
  createDecipheriv,
  Decipher,
  randomBytes,
  scrypt,
} from 'crypto';
import { promisify } from 'util';

interface IEncryptedInfo {
  iv: Buffer;
  cipher: Cipher;
  encryptedText: Buffer;
  key: CipherKey;
}
@Injectable()
export class CryptoService {
  private password = 'Hello there, General Kenobi';
  private static DECIPHER: Decipher;
  private async createCipher(): Promise<[Cipher, CipherKey, Buffer]> {
    const key = await this.createKey();
    const iv = this.createIv();
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    return [cipher, key, iv];
  }

  private async createKey() {
    const key = await promisify(scrypt)(
      this.password,
      'A More Civilized Age',
      32,
    );
    return key as CipherKey;
  }
  private createIv() {
    const iv = randomBytes(16);
    return iv;
  }
  public async encryptText(text: string): Promise<IEncryptedInfo> {
    const [cipher, key, iv] = await this.createCipher();
    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
      cipher,
      key,
      iv,
      encryptedText,
    };
  }
  private createDecipher(encryptedInfo: IEncryptedInfo) {
    const decipher = createDecipheriv(
      'aes-356-gcm',
      encryptedInfo.key,
      encryptedInfo.iv,
    );
    return decipher;
  }

  decrypt(encryptedInfo: IEncryptedInfo) {
    const decipher = this.createDecipher(encryptedInfo);
    const decryptedText = Buffer.concat([
      decipher.update(encryptedInfo.encryptedText),
      decipher.final(),
    ]);
    const string = this.stringifyBuffer(decryptedText);
    return string;
  }

  private stringifyBuffer(decryptedText: Buffer) {
    return decryptedText.toString();
  }
}
