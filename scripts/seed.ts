import { runSeed } from "@/lib/seed";

const force = process.argv.includes("--force");
runSeed({ force })
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
