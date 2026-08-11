const { execSync } = require("child_process");

const testFiles = [
    "src/tests/integration/health.test.ts",
    "src/tests/integration/auth.test.ts",
    "src/tests/integration/project.test.ts",
];

let hasFailure = false;

for (const file of testFiles) {
    console.log(`\n▶ Running ${file}...\n`);
    try {
        execSync(`npx vitest run ${file}`, {
            stdio: "inherit",
            env: { ...process.env, NODE_ENV: "test" }
        });
    } catch (err) {
        hasFailure = true;
        console.error(`\n✗ ${file} FAILED\n`);
    }
}

if (hasFailure) {
    console.error("\n❌ Some test files failed.\n");
    process.exit(1);
} else {
    console.log("\n✅ All test files passed.\n");
    process.exit(0);
}