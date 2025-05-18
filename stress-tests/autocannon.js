import autocannon from "autocannon";
import fs from "fs/promises";
import stripAnsi from "strip-ansi";

const baseUrl = "http://localhost:3000";

const result1user = autocannon({
  title: "1 user",
  url: baseUrl,
  connections: 1,
  amount: 1,
});

const result10users = autocannon({
  title: "10 users",
  url: baseUrl,
  connections: 10,
  amount: 10,
});

const result100users = autocannon({
  title: "100 users",
  url: baseUrl,
  connections: 100,
  amount: 100,
});

const result1000users = autocannon({
  title: "1000 users",
  url: baseUrl,
  connections: 100,
  amount: 1000,
});

const result10000users = autocannon({
  title: "10000 users",
  workers: 10,
  url: baseUrl,
  connections: 100,
  amount: 10000,
});

const results = await Promise.all([
  result1user,
  result10users,
  result100users,
  result1000users,
  result10000users,
]);

try {
  const allResults = results
    .map((result) => stripAnsi(autocannon.printResult(result)))
    .join("\n\n");
  await fs.writeFile("./stress-tests/results.txt", allResults);
} catch (error) {
  console.error(error);
} finally {
  console.log("done");
}
