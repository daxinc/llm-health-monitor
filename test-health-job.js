// Test script for _startHealthyStatusJobAsync implementation
const { ModelManager } = require("./ModelManager");

async function testHealthJob() {
  console.log("Testing _startHealthyStatusJobAsync implementation...\n");

  const manager = new ModelManager();
  manager._init(); // Initialize models

  console.log(`Initialized ${manager.models.size} models`);

  // Start the health monitoring job
  console.log("Starting health monitoring job...");
  manager._startHealthyStatusJobAsync();

  // Let it run for a short time to see some health checks
  console.log(
    "Monitoring for 30 seconds... (you should see health check logs)",
  );

  // Wait for 30 seconds then stop
  setTimeout(() => {
    console.log(
      "\nTest completed. Health monitoring job is running in background.",
    );
    console.log("Check the logs above to see health check results.");
    process.exit(0);
  }, 30000); // 30 seconds
}

testHealthJob().catch(console.error);
