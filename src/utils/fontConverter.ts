import fs from 'fs';
import path from 'path';

export const convertFontToBase64 = (fontPath: string): string => {
  try {
    const fontBuffer = fs.readFileSync(fontPath);
    return fontBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting font to base64:', error);
    throw error;
  }
}; 