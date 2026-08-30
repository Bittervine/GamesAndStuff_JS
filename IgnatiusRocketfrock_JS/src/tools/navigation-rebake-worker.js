import { rebakeAndVerifyNavigation } from "./navigation-rebake.js";

self.addEventListener("message", (event) => {
    const message = event.data || {};
    if (message.type !== "rebake-navigation") return;
    const jobId = String(message.jobId || "");
    try {
        const result = rebakeAndVerifyNavigation(message.level, message.context || {}, {
            verifyBySimulation: message.verifyBySimulation === true,
            stepTransitionMethod: message.stepTransitionMethod || "stride_arc",
            includeWizard: message.includeWizard !== false,
            preserveMatchingVerification: message.preserveMatchingVerification !== false,
            reuseSimulationProofs: message.reuseSimulationProofs !== false,
            compareStepMethods: message.compareStepMethods === true,
            progressInterval: Math.max(1, Math.floor(Number(message.progressInterval) || 20)),
            onProgress(progress) {
                self.postMessage({ type: "navigation-rebake-progress", jobId, ...progress });
            }
        });
        self.postMessage({ type: "navigation-rebake-complete", jobId, ...result });
    } catch (error) {
        self.postMessage({
            type: "navigation-rebake-error",
            jobId,
            message: error?.message || String(error),
            stack: error?.stack || ""
        });
    }
});
