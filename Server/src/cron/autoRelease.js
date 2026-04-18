import cron from "node-cron";
import milestoneModel from "../models/milestone.model.js";

const autoRelease = cron.schedule("0 0 * * *", async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const overdueMilestones = await milestoneModel.find({
      status: "submitted",
      submittedAt: { $lt: sevenDaysAgo },
    });

    for (const milestone of overdueMilestones) {
      milestone.status = "released";
      await milestone.save();
    }

    console.log(`Auto-release ran: ${overdueMilestones.length} milestones released`);
  } catch (err) {
    console.error("Auto-release cron error:", err);
  }
});

export default autoRelease;