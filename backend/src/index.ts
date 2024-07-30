import { create_server } from "./server";
import { database_pool } from "./database";

// Docker signal handling

const server = create_server();

process.on("SIGINT", function onSigint() {
  console.info(
    "Got SIGINT (aka ctrl-c in docker). Graceful shutdown ",
    new Date().toISOString(),
  );
  shutdown();
});

process.on("SIGTERM", function onSigterm() {
  console.info(
    "Got SIGTERM (docker container stop). Graceful shutdown ",
    new Date().toISOString(),
  );
  shutdown();
});

function shutdown() {
  server.close(function onServerClosed(err) {
    database_pool.end();
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
}
