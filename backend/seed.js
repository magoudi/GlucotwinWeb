if (require.main === module) {
  require("dotenv").config();
}

const { connectDB } = require("./db");

const defaultUserPageData = [
  {
    slug: "dashboard",
    data: {
      metrics: [
        { label: "Current glucose", value: "112", detail: "mg/dL steady" },
        { label: "Time in range", value: "78%", detail: "+6% this week" },
        { label: "Low risk next 4h", value: "9%", detail: "reduced" },
        { label: "Twin confidence", value: "92%", detail: "fresh data" },
      ],
      actions: [
        {
          time: "18:15",
          copy: "Take dinner bolus 12-16 minutes before eating.",
        },
        {
          time: "19:30",
          copy: "A 15 minute walk lowers predicted peak by 22 mg/dL.",
        },
        {
          time: "23:00",
          copy: "Add bedtime check. Twin sees mild overnight low risk.",
        },
      ],
      comparison: [
        {
          tag: "Option A",
          name: "6u at meal",
          copy: "Peak 204 mg/dL, delayed correction likely.",
        },
        {
          tag: "Option B",
          name: "5u pre-bolus",
          copy: "Peak 162 mg/dL, lower overnight risk.",
        },
      ],
      careNote:
        "Your breakfast ratio may need review on school days. Share this week's twin summary with Dr. Salma before your appointment.",
    },
  },
  {
    slug: "twin-simulator",
    data: {
      scenario: "Lunch at 13:15 with 62g carbs and planned walk.",
      inputs: [
        { label: "Carbohydrates", value: "62 g" },
        { label: "Bolus insulin", value: "5 units" },
      ],
      recommendation: "Recommended: 12 to 16 minutes before meal.",
      outcome: { value: "162", detail: "mg/dL peak" },
      outcomeRows: [
        { time: "+45m", copy: "Peak remains below high-risk threshold." },
        { time: "+2h", copy: "Return to target range expected." },
      ],
      compareColumns: ["Scenario", "Peak", "Low risk", "Recommendation"],
      compareRows: [
        ["6u at meal", "204 mg/dL", "7%", "Not preferred"],
        ["5u, 14 min pre-bolus", "162 mg/dL", "9%", "Best balance"],
        ["5u + 15 min walk", "148 mg/dL", "13%", "Use caution"],
      ],
    },
  },
  {
    slug: "cgm-history",
    data: {
      metrics: [
        { label: "Average glucose", value: "136", detail: "mg/dL" },
        { label: "Variability", value: "31%", detail: "moderate" },
        { label: "Night lows", value: "3", detail: "last 14 days" },
        { label: "Sensor wear", value: "96%", detail: "complete data" },
      ],
      patterns: [
        { time: "06:20", copy: "Dawn rise appears on 9 of 14 days." },
        {
          time: "15:00",
          copy: "School-day snack prevents late afternoon dip.",
        },
        { time: "02:00", copy: "Mild low cluster after high activity days." },
      ],
      quality: [{ label: "CGM stream", value: "Live" }],
    },
  },
  {
    slug: "care-team",
    data: {
      members: [
        {
          initials: "DS",
          name: "Dr. Salma Nabil",
          role: "Endocrinologist",
          access: "Full access",
        },
        {
          initials: "MH",
          name: "Mona Hassan",
          role: "Caregiver",
          access: "Alerts",
        },
        {
          initials: "RN",
          name: "Clinic nurse",
          role: "Diabetes educator",
          access: "Reports",
        },
      ],
      summary:
        "Breakfast ratio and dawn-rise patterns are ready for review. The twin suggests testing a minor timing change before altering basal rate.",
      messages: [
        {
          date: "Today",
          copy: "Dr. Salma requested the last 14 days of overnight lows.",
        },
        {
          date: "Apr 30",
          copy: "Caregiver acknowledged bedtime check reminder.",
        },
        {
          date: "Apr 27",
          copy: "Clinic nurse added education note about exercise days.",
        },
      ],
    },
  },
  {
    slug: "settings",
    data: {
      devices: [
        { name: "Dexcom CGM", status: "Connected" },
        { name: "Insulin pump", status: "Connected" },
        { name: "Apple Health activity", status: "Connected" },
        { name: "Meal logging app", status: "Connect" },
      ],
      alerts: [
        "Predicted low risk",
        "High glucose forecast",
        "alert Caregiver",
        "Weekly twin report",
      ],
      privacyColumns: ["Data source", "Used by twin", "Shared", "Retention"],
      privacyRows: [
        ["CGM readings", "Yes", "Care team", "24 months"],
        ["Insulin logs", "Yes", "Care team", "24 months"],
        ["Location", "No", "Never", "Disabled"],
      ],
    },
  },
  {
    slug: "basal-plan",
    data: {
      blocks: [
        { time: "00:00", rate: "0.70 units/hour" },
        { time: "05:00", rate: "0.95 units/hour" },
        { time: "10:00", rate: "0.75 units/hour" },
        { time: "13:00", rate: "0.65 units/hour" },
        { time: "18:00", rate: "0.80 units/hour" },
        { time: "22:00", rate: "0.72 units/hour" },
      ],
      reviewFocus: "Review dawn segment",
      reviewCopy:
        "Twin sees repeated rise from 05:40 to 07:15. Discuss small basal timing shift with care team.",
      reviewStats: [
        { label: "Total daily basal", value: "18.4u" },
        { label: "Overnight low risk", value: "11%" },
        { label: "Confidence", value: "High" },
      ],
      tableColumns: ["Time window", "Rate", "Twin signal", "Status"],
      tableRows: [
        ["00:00-05:00", "0.70 u/h", "Stable overnight", "Keep"],
        ["05:00-10:00", "0.95 u/h", "Dawn rise", "Review"],
        ["18:00-22:00", "0.80 u/h", "Dinner recovery", "Keep"],
      ],
    },
  },
  {
    slug: "food-insulin-log",
    data: {
      fields: [
        { label: "Time", value: "13:15" },
        { label: "Meal type", value: "Lunch" },
        { label: "Food items", value: "Chicken, quinoa, salad" },
        { label: "Total carbs", value: "52 g" },
        { label: "Bolus insulin", value: "5 units" },
        { label: "Bolus timing", value: "14 min before meal" },
      ],
      notes:
        "Walk planned after lunch. No illness. Moderate stress from school exam.",
      quality: { value: "88%", label: "complete" },
      missingLabel: "Missing detail",
      missingCopy:
        "Add fat/protein estimate to improve delayed glucose forecast.",
      timelineColumns: ["Time", "Food", "Insulin", "Outcome"],
      timelineRows: [
        ["08:05", "Toast, eggs, apple", "4.5u", "Peak 186"],
        ["10:45", "Correction snack", "0u", "Stable"],
        ["13:15", "Chicken quinoa plate", "5u", "Forecast 158"],
        ["19:30", "Dinner planned", "Pending", "Needs bolus"],
      ],
    },
  },
  {
    slug: "nutrition-recommendations",
    data: {
      metrics: [
        { label: "Carb budget lunch", value: "55g", detail: "recommended" },
        { label: "Protein target", value: "28g", detail: "per main meal" },
        { label: "Fiber goal", value: "8g", detail: "for smoother curve" },
        { label: "Pre-bolus window", value: "14m", detail: "before lunch" },
      ],
      meals: [
        {
          meal: "Breakfast",
          name: "Greek yogurt bowl",
          copy: "32g carbs, 24g protein, berries, chia, low glycemic load.",
          peak: "142 mg/dL",
          width: "64%",
        },
        {
          meal: "Lunch",
          name: "Chicken quinoa plate",
          copy: "52g carbs, high fiber, balanced fat to reduce spike speed.",
          peak: "158 mg/dL",
          width: "64%",
        },
        {
          meal: "Snack",
          name: "Apple + peanut butter",
          copy: "22g carbs. Best before activity or mild downward trend.",
          peak: "126 mg/dL",
          width: "72%",
        },
      ],
      swaps: [
        {
          name: "Rice",
          copy: "Swap half portion for lentils to lower predicted peak by 18 mg/dL.",
        },
        {
          name: "Juice",
          copy: "Reserve for low treatment; choose whole fruit with protein.",
        },
        {
          name: "Dinner",
          copy: "Add vegetables first to slow absorption before evening bolus.",
        },
      ],
      macros: ["45% Carbs", "25% Protein", "30% Fat", "8g Fiber"],
      macroCopy:
        "GlucoTwin recommends pairing carbs with protein and fiber today because morning sensitivity is lower than usual.",
    },
  },
  {
    slug: "profile-details",
    data: {
      user: {
        initials: "MH",
        displayName: "GlucooooooTwinnnn",
        subtitle: "Type 1 diabetes profile",
        username: "glucotwin",
        email: "glucotwin@example.com",
        phone: "+20 100 234 8891",
        bio: "School days, afternoon activity, and exam stress often affect my glucose pattern.",
      },
      status: [
        { label: "Email", value: "glucotwin@example.com", status: "Verified" },
        { label: "Phone", value: "+20 100 234 8891", status: "Primary" },
        { label: "CGM account", value: "Dexcom connected", status: "Live" },
      ],
    },
  },
  {
    slug: "profile-security",
    data: {
      signIn: [
        { method: "Password", detail: "Last changed 2 months ago" },
        {
          method: "Two-factor authentication",
          detail: "Authenticator app enabled",
        },
        { method: "Recovery email", detail: "glucotwin.backup@example.com" },
      ],
      sessions: [
        {
          device: "MacBook Pro",
          detail: "Cairo, active now",
          status: "Current",
        },
        {
          device: "iPhone 15",
          detail: "Cairo, 2 hours ago",
          status: "Trusted",
        },
        {
          device: "Chrome browser",
          detail: "Alexandria, Apr 29",
          status: "Review",
        },
      ],
    },
  },
  {
    slug: "profile-preferences",
    data: {
      display: [
        { label: "Glucose units", value: "mg/dL" },
        { label: "Default dashboard range", value: "14 days" },
        { label: "Time format", value: "24 hour" },
        { label: "Language", value: "English" },
      ],
      notifications: [
        { label: "Meal reminders", enabled: true },
        { label: "Predicted low risk alerts", enabled: true },
        { label: "Weekly summary", enabled: true },
        { label: "Care team comments", enabled: true },
      ],
    },
  },
  {
    slug: "profile-subscription",
    data: {
      plan: {
        name: "GlucoTwin Plus",
        price: "$19",
        interval: "/mo",
        summary: "Advanced simulation, care sharing, and 14 day twin training.",
        features: [
          "Unlimited what-if scenarios",
          "Care team summaries",
          "CGM and pump sync",
        ],
      },
      billing: [
        { label: "Next billing date", value: "June 4, 2026" },
        { label: "Payment method", value: "Visa ending 4242" },
        { label: "Billing email", value: "glucotwin@example.com" },
      ],
    },
  },
  {
    slug: "profile-privacy",
    data: {
      columns: ["Data source", "Used by twin", "Shared", "Retention"],
      rows: [
        ["CGM readings", "Yes", "Care team", "24 months"],
        ["Insulin logs", "Yes", "Care team", "24 months"],
        ["Meals and notes", "Yes", "Care team", "12 months"],
        ["Location", "No", "Never", "Disabled"],
      ],
    },
  },
];

async function seed() {
  await connectDB();
  const mongoose = require('mongoose');
  const db = mongoose.connection.db;
  const users = db.collection("users");

  await db
    .collection("pages")
    .drop()
    .catch((error) => {
      if (error.codeName !== "NamespaceNotFound") {
        throw error;
      }
    });
  await db
    .collection("userPageData")
    .drop()
    .catch((error) => {
      if (error.codeName !== "NamespaceNotFound") {
        throw error;
      }
    });
  await users.createIndex({ email: 1 }, { unique: true });
  await db
    .collection("userPageData")
    .createIndex({ userId: 1, slug: 1 }, { unique: true });

  const existingUsers = await users
    .find({}, { projection: { _id: 1 } })
    .toArray();

  if (existingUsers.length > 0) {
    const now = new Date();
    await db.collection("userPageData").insertMany(
      existingUsers.flatMap((user) =>
        defaultUserPageData.map((page) => ({
          userId: user._id,
          slug: page.slug,
          data: page.data,
          createdAt: now,
          updatedAt: now,
        })),
      ),
    );
  }

  console.log(
    `Prepared ${db.databaseName}.users and rebuilt ${existingUsers.length * defaultUserPageData.length} user page data documents`,
  );
  process.exit(0);
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  defaultUserPageData,
};
