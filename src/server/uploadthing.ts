import { createUploadthing } from 'uploadthing/server'
import type { FileRouter } from 'uploadthing/server'
import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from '@uploadthing/react'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(() => {}), // Silences type error
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter

export const { useUploadThing } = generateReactHelpers<UploadRouter>()

export const UploadDropzone = generateUploadDropzone<UploadRouter>()
export const UploadButton = generateUploadButton<UploadRouter>()