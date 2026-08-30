import { verifyEnemyNavigationGraphBySimulation } from "../core/simulation.js";

function navigationSimulationEdgeCount(graph) {
    return (graph?.edges || []).reduce((sum, edge) => sum + ((edge?.type === "step" || edge?.type === "jump" || edge?.type === "drop") ? 1 : 0), 0);
}

self.addEventListener("message", (event) => {
    const message = event.data || {};
    if (message.type !== "verify-navigation-graphs") return;
    const jobId = String(message.jobId || "");
    const world = message.world || {};
    const profiles = Array.isArray(message.profiles) ? message.profiles : [];
    const totalEdges = profiles.reduce((sum, graph) => sum + navigationSimulationEdgeCount(graph), 0);
    const verifiedProfiles = [];
    const failures = [];
    let completedEdges = 0;
    let rejectedEdges = 0;
    let elapsedMs = 0;

    try {
        for (let profileIndex = 0; profileIndex < profiles.length; profileIndex += 1) {
            const graph = profiles[profileIndex];
            const profileEdges = navigationSimulationEdgeCount(graph);
            self.postMessage({
                type: "navigation-simulation-progress",
                jobId,
                profileIndex,
                profileCount: profiles.length,
                profileId: graph?.id || "",
                checkedEdges: completedEdges,
                totalEdges,
                rejectedEdges,
                profileCheckedEdges: 0,
                profileTotalEdges: profileEdges
            });
            const verification = verifyEnemyNavigationGraphBySimulation(world, graph, {
                progressInterval: 20,
                onProgress(progress) {
                    self.postMessage({
                        type: "navigation-simulation-progress",
                        jobId,
                        profileIndex,
                        profileCount: profiles.length,
                        profileId: graph?.id || "",
                        checkedEdges: completedEdges + progress.checkedEdges,
                        totalEdges,
                        rejectedEdges: rejectedEdges + progress.rejectedEdges,
                        profileCheckedEdges: progress.checkedEdges,
                        profileTotalEdges: progress.totalCheckedEdges
                    });
                }
            });
            verifiedProfiles.push(verification.graph);
            for (const failure of verification.failures) failures.push({ profileId: graph?.id || "", ...failure });
            completedEdges += verification.summary.checkedEdges;
            rejectedEdges += verification.summary.rejectedEdges;
            elapsedMs += verification.summary.elapsedMs;
        }
        self.postMessage({
            type: "navigation-simulation-complete",
            jobId,
            profiles: verifiedProfiles,
            failures,
            summary: {
                checkedEdges: completedEdges,
                rejectedEdges,
                elapsedMs
            }
        });
    } catch (error) {
        self.postMessage({
            type: "navigation-simulation-error",
            jobId,
            message: error?.message || String(error),
            stack: error?.stack || ""
        });
    }
});
