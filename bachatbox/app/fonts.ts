// app/fonts.ts
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'], // regular and bold
  display: 'swap',
});
