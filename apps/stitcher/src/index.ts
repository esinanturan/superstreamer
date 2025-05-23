import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { cors } from "hono/cors";
import { ApiError } from "./errors";
import { outApp } from "./routes/out";
import { sessionsApp } from "./routes/sessions";

const app = new Hono()
  .use(cors())
  .route("/sessions", sessionsApp)
  .route("/out", outApp);

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Superstreamer Stitcher API",
        version: "1.0.0",
        description:
          "Realtime playlist manipulator. Can be used for ad, bumper or other HLS interstitials insertion on-the-fly. Can apply filters to playlists.",
      },
      tags: [
        {
          name: "Sessions",
          description: "A session is an individual playout session per viewer.",
        },
      ],
    },
  }),
);

app.onError((error, c) => {
  if (error instanceof ApiError) {
    return c.json(
      {
        code: error.code,
      },
      error.status,
    );
  }

  console.error(error);

  return c.json(
    {
      message:
        "Unexpected error, this is most likely a bug. Please, report it.",
    },
    500,
  );
});

const gracefulShutdown = () => {
  process.exit(0);
};

process
  .on("beforeExit", gracefulShutdown)
  .on("SIGINT", gracefulShutdown)
  .on("SIGTERM", gracefulShutdown);

export default app;
