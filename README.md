# <img src="https://github.com/matvp91/mixwave/blob/main/assets/logo.png?raw=true" width="140" />

Mixwave is a comprehensive toolset designed to streamline your video workflow, covering everything from transcoding and packaging to playback. With its user-friendly API, Mixwave makes self-hosting videos easy.

The video world is full of variety, with numerous codecs and various playout protocols like MPEG-DASH and HLS. We believe that video doesn't have to be so fragmented, so we focus primarily on the following key areas:

- **HLS CMAF**: By exclusively supporting HLS CMAF, we can fine-tune our solutions to achieve perfection.
- **Batch transcoding**: Our queue architecture simplifies horizontal scaling by enabling multiple transcoding jobs to run simultaneously across different machines.
- **Adaptive streaming**: Multiple video / audio tracks, ensuring smooth playback on any device or network condition.
- **Playback**: [HLS.js](https://github.com/video-dev/hls.js) compatible, aslong as [MSE](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API) and [EME](https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API) are available, you're good to go.

Mixwave consists of the following packages:

- **API**: Designed to simplify the complex task of transcoding and packaging video files.
- **Dashboard**: A frontend application that provides insights of running jobs and offers a user-friendly interface to the API for testing purposes.
- **Artisan**: A queue-architectured job runner designed for a variety of tasks, such as FFmpeg processing and packaging.
- **Stitcher**: A manifest manipulation proxy that enables the creation of personalized manifests, heavily focused on [HLS Interstitials](https://developer.apple.com/streaming/GettingStartedWithHLSInterstitials.pdf).

> [!TIP]
> We rely on `S3` as storage, your input can be `http` or `s3` but the output will always be produced and uploaded to `S3`. Take a look at [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) if you want to keep costs manageable as they do not charge for egress.

## API

We're currently a bit short on documention but don't let that hold you back on experimenting. Converting your own media to an adaptive media format basically comes down to calling the 3 following endpoints.

### 1. Transcode

Prepare your video by transcoding your file(s) into CMAF compliant streams, ready to be packaged afterwards.

> **POST** /transcode

<details>
<summary>Example payload with sources on S3</summary>

```json
{
  "inputs": [
    {
      "path": "s3://BigBuckBunny.mp4",
      "type": "video"
    },
    {
      "path": "s3://BigBuckBunny.mp4",
      "type": "audio",
      "language": "eng"
    },
    {
      "path": "s3://subtitle.vtt",
      "type": "text",
      "language": "eng"
    }
  ],
  "streams": [
    {
      "type": "video",
      "codec": "h264",
      "height": 720,
      "bitrate": 4000000,
      "framerate": 24
    },
    {
      "type": "video",
      "codec": "h264",
      "height": 480,
      "bitrate": 1500000,
      "framerate": 24
    },
    {
      "type": "text",
      "language": "eng"
    }
  ],
  "segmentSize": 4
}
```

</details>

The transcode job will result in an `assetId`, your stream can now be referenced from by this ID. Next up, package it as you like.

### 2. Package

> **POST** /package

<details>
<summary>Example payload</summary>

```json
{
  "assetId": "16644b94-a665-4ca2-8543-4aa519e853d8"
}
```

</details>

> [!NOTE]
> Today we do not support additional configuration when packaging (such as DRM related settings), it'll produce a CMAF compliant, plain, HLS manifest.

The HLS manifest will be available at `{S3_URL}/package/16644b94-a665-4ca2-8543-4aa519e853d8/hls/master.m3u8`.

You can also use the `playlist` endpoint with the same `assetId` to generate a `stitcher` (manifest manipulator) URL and provide it with interstitials as you like.

### 3. Playlist

The playlist endpoint is merely there to generate a `stitcher` URL. If you don't need manifest manipulation of any form, you don't need this and you can play the `HLS` manifest from your `s3` bucket generated by the previous step.

> **POST** /playlist/{assetId}

Now that we have an HLS playlist to work with, we can use the `stitcher` to manipulate its output. Let's say we want to add another playlist (think of a bumper, or a preroll ad) before our main playlist, we can POST to the endpoint with an `interstitials` list that points to other assets (by id) we packaged before.

<details>
<summary>Example payload</summary>

```json
{
  "interstitials": [
    {
      "offset": 0,
      "assetId": "dcbc11c4-3adc-46d6-9ed3-672b7e19fef9"
    }
  ]
}
```

</details>

This endpoint will return a stitched HLS playlist URL that points to the stitcher proxy.
