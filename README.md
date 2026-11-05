This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Adding translation inference

The camera and MediaPipe lifecycle is isolated in `hooks/useCamera.ts`. It currently draws pose, face, and hand landmarks on the preview but does not make predictions. To connect a TensorFlow.js model later:

1. Add a model adapter, for example `lib/sign-model.ts`, that loads the trained model and converts the landmark arrays from the MediaPipe `Results` callback into the model's input tensor shape.
2. Add an `onLandmarks` callback option to `useCamera` and call it with each `Results` object after `drawLandmarks` runs. Keep model loading and prediction outside the camera hook.
3. Pass the adapter callback from `Translator` and update `translatedText` only with real model output. Add throttling or a confidence threshold in the adapter rather than simulating recognition in the UI.

For text to sign, replace `AvatarPlaceholder` with an avatar component and call its future translation adapter from `TranslationInput`'s `onTranslate` callback. No model or avatar animation is loaded by the current interface.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
