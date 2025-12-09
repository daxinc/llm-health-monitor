const CONFIGURED_MODELS = require("./models.json");

class StatusHistory {
  constructor(timestamp, isHealthy) {
    this.timestamp = timestamp;
    this.isHealthy = isHealthy;
  }
}

/**
 * Represents a language model with health and availability information.
 * @class
 */
class Model {
  /**
   * Creates a new Model instance.
   * @constructor
   * @param {string} id - The unique identifier for the model.
   * @param {string} name - The name of the model.
   */
  constructor(id, name) {
    /** @type {string} The unique identifier for the model. */
    this.id = id;
    /** @type {string} The name of the model. */
    this.name = name;
    /** @type {number} The availability score of the model (0.0 to 1.0). */
    this.availability = 0.0;
    /** @type {boolean} Indicates if the model is currently healthy. */
    this.isHealthy = false;
    /** @type {boolean} Indicates if the model is preferred for use. */
    this.isPreferred = false;

    /**
     * Status history.
     */
    this.history = [];
  }

  updateHealthyStatus(timestamp, isHealthy) {
    this.isHealthy = isHealthy;
    this.history.push(new StatusHistory(timestamp, isHealthy));

    // Keep history size to 10
    if (this.history.length > 10) this.history.shift();
  }
}

/**
 * Manages a collection of language models and handles model health checks and interviews.
 * @class
 */
class ModelManager {
  /**
   * Creates a new ModelManager instance.
   * @constructor
   */
  constructor() {
    /** @type {Map<string, Model>} Map of model IDs to Model instances. */
    this.models = new Map();

    this.healthyStatusJobHandler = null;
    this._init();
    this._startHealthyStatusJobAsync();
  }

  /**
   * Initializes the models from the configured models list.
   * @private
   */
  _init() {
    for (let m of CONFIGURED_MODELS) {
      this.models.set(m.id, new Model(m.id, m.name));
    }
  }

  destroy() {
    if (this.healthyStatusJobHandler)
      clearInterval(this.healthyStatusJobHandler);
  }

  allModelStatus() {
    return Array.from(this.models.values());
  }

  remove(modelId) {
    return {
      success: this.models.delete(modelId),
    };
  }

  /**
   * Attempts to use the specified model for an interview. If the model is not healthy, it tries other available models.
   * @param {string} modelId - The ID of the model to attempt to use.
   * @returns {Promise<{successful: boolean, logs: string[]}>} An object containing the success status and logs of the operation.
   */
  async use(modelId) {
    const result = {
      successful: false,
      modelName: null,
      logs: [],
    };
    let isHealthy = await this._isHealthy(modelId);
    let model = this.models.get(modelId);
    model.updateHealthyStatus(Date.now(), isHealthy);

    if (isHealthy) {
      result.successful = true;
      result.modelName = model.name;
      result.logs.push(`Started interview with ${model.name} successfully.`);
      return result;
    }

    result.logs.push(`${model.name} is not healthy, trying other models ...`);

    for (let id of this.models.keys()) {
      if (id === modelId) continue; // don't try it again.

      isHealthy = await this._isHealthy(id);
      model = this.models.get(id);
      model.updateHealthyStatus(Date.now(), isHealthy);
      if (isHealthy) {
        result.logs.push(`Started interview with ${model.name} successfully.`);
        result.successful = true;
        result.modelName = model.name;
        break;
      }

      result.logs.push(`${model.name} is not healthy, trying other models ...`);
    }

    if (!result.successful) {
      result.logs.push(`No model is healthy, gave up.`);
    }

    return result;
  }

  /**
   * Starts a background job that continuously monitors the health status of all configured language models.
   *
   * This method runs health checks every minute (60 seconds) by calling _isHealthy() for each model in parallel.
   * For each model, it:
   * - Updates the model's isHealthy property based on the health check result
   * - Calculates availability score based on recent health history
   * - Records the health status, timestamp in the model's history
   * - Logs the health check results for monitoring
   *
   * The health checks are executed concurrently for all models to minimize total check time.
   * The job continues running indefinitely until explicitly stopped via the destroy() method.
   *
   * @returns {void} This method doesn't return a value but starts a background monitoring process
   * @todo: This should be implemented as a cron job from a different services. For simplicity, it is included here.
   * @todo: assume the job never fail once it is starte for simplicity.
   */
  _startHealthyStatusJobAsync() {
    if (this.healthyStatusJobHandler) {
      console.log(
        `The job is already running under handler ${this.healthyStatusJobHandler}`,
      );
      return;
    }

    // Run health checks every minute (60,000 milliseconds)
    this.healthyStatusJobHandler = setInterval(async () => {
      const timestamp = Date.now();

      // Prepare all health check promises to run in parallel
      const healthCheckPromises = Array.from(this.models.entries()).map(
        async ([modelId, model]) => {
          try {
            const isHealthy = await this._isHealthy(modelId);

            // Update model's healthy status
            model.updateHealthyStatus(timestamp, isHealthy);

            // Calculate availability based on recent history
            const healthyCount = model.history.filter(
              (h) => h.isHealthy,
            ).length;
            model.availability =
              model.history.length > 0
                ? healthyCount / model.history.length
                : 0;

            const modelConfig = CONFIGURED_MODELS.find((m) => m.id === modelId);

            console.log(
              `Health check completed for ${model.name}: healthy=${isHealthy}, availability=${model.availability.toFixed(2)}`,
            );
          } catch (error) {
            console.error(`Error checking health for model ${modelId}:`, error);
          }
        },
      );

      // Execute all health checks in parallel
      await Promise.allSettled(healthCheckPromises);
    }, 60000);
  }

  /**
   * Starts an interview with the first available healthy model.
   * @returns {Model|null} The model chosen for the interview, or null if no model is available.
   */
  start() {
    for (let modelId of this.models.keys()) {
      if (this.startInterviewWith(modelId)) {
        return this.models.get(modelId);
      }
    }

    return null;
  }

  /**
   * Starts an interview with a specific model by its ID.
   * @param {string} modelId - The ID of the model to start the interview with.
   * @returns {Model|null} The model instance if interview started successfully, or null if failed.
   */
  startWith(modelId) {
    if (this.startInterviewWith(modelId)) {
      return this.models.get(modelId);
    }

    return null;
  }

  /*
  TODO: It does simply check, in production the policy to decide if the service is healthy or not is decided by:
  
  | Parameter               | Default        |
  | ----------------------- | -------------- |
  | IntervalSeconds         | **30 seconds** |
  | TimeoutSeconds          | **5 seconds**  |
  | HealthyThresholdCount   | **5**          |
  | UnhealthyThresholdCount | **2**          |
  */
  /**
     * Check if the model is healthy for conducting interview.
     * @param {string} modelId LLM model ID used to start the interview.
     * @returns {Promise<boolean>} true if interview started successfully, false otherwise
     */
  async _isHealthy(modelId) {
    // Check for invalid model ID
    if (!this.models.has(modelId)) {
      console.log(`Model ID "${modelId}" is invalid or not found`);
      return false;
    }

    const model = this.models.get(modelId);
    console.log(
      `Checking if "${model.name}" is healthy for conducting interview ...`,
    );

    const { spawn } = require("child_process");

    return new Promise((resolve) => {
      // Call "python3 check-model-health.py <model_id>"
      const child = spawn("python3", ["check-model-health.py", modelId], {
        stdio: "inherit",
        cwd: __dirname,
      });

      child.on("close", (code) => {
        if (code === 0) {
          console.log(`"${model.name}" is healthy for conducting interview.`);
          resolve(true);
        } else {
          console.log(
            `"${model.name}" is NOT available for conducting interview. Exit status: ${code}`,
          );
          resolve(false);
        }
      });

      child.on("error", (error) => {
        console.error(`Error running health check for "${model.name}":`, error);
        resolve(false);
      });
    });
  }
}

module.exports = { ModelManager, Model, StatusHistory };
