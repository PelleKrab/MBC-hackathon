import { Market } from "../types";

export function generateMockMarkets(): Market[] {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  return [
    {
      id: "mbc-pie",
      question: "Will Jesse get pied in the face at MBC?",
      description:
        "Market resolves YES if Jesse receives a pie to the face (whipped cream, shaving cream, or similar) during the Midwest Blockchain Conference. Must be witnessed by at least 3 attendees.",
      deadline: now + 2 * oneDay,
      resolutionDate: now + 3 * oneDay,
      yesPool: 4.2,
      noPool: 2.8,
      bountyPool: 0.78,
      status: "active",
      createdAt: now - 6 * oneHour,
    },
    {
      id: "mbc-snowman",
      question: "Will someone build a snowman at MBC?",
      description:
        "Resolves YES if a snowman (minimum 2 feet tall with identifiable features) is built anywhere on the Ross building grounds during the conference. Photo evidence required.",
      deadline: now + oneDay,
      resolutionDate: now + 2 * oneDay,
      yesPool: 1.5,
      noPool: 6.2,
      bountyPool: 0.86,
      status: "active",
      createdAt: now - 12 * oneHour,
    },
    {
      id: "mbc-ross-ships",
      question: "Will Ross ship a working demo during the hackathon?",
      description:
        "Market resolves YES if Ross successfully demos a functional project during the MBC hackathon showcase. 'Working' means it doesn't crash during the demo and performs its intended function.",
      deadline: now + 18 * oneHour,
      resolutionDate: now + 2 * oneDay,
      yesPool: 8.9,
      noPool: 1.2,
      bountyPool: 1.12,
      status: "active",
      createdAt: now - 3 * oneHour,
    },
    {
      id: "mbc-pizza",
      question: "Will pizza arrive before midnight on hackathon night?",
      description:
        "Resolves YES if pizza is delivered and available to hackathon participants before 12:00 AM local time. Any pizza counts - must be at least 3 pizzas for the group.",
      deadline: now + 8 * oneHour,
      resolutionDate: now + 12 * oneHour,
      yesPool: 5.5,
      noPool: 3.3,
      bountyPool: 0.98,
      status: "active",
      createdAt: now - 2 * oneHour,
    },
    {
      id: "mbc-allnighter",
      question: "Will more than 10 people pull an all-nighter?",
      description:
        "Market resolves YES if more than 10 confirmed hackathon participants are still awake and working at 6:00 AM on hackathon day. Sleeping on keyboards doesn't count as awake.",
      deadline: now + 14 * oneHour,
      resolutionDate: now + 20 * oneHour,
      yesPool: 3.1,
      noPool: 4.7,
      bountyPool: 0.87,
      status: "active",
      createdAt: now - 5 * oneHour,
    },
    {
      id: "mbc-first-demo",
      question: "Which team will demo first at the showcase?",
      description:
        "Bet YES if you think a team name starting with A-M will demo first. Bet NO if you think a team starting with N-Z will demo first. Random draw if no volunteers.",
      deadline: now + oneDay + 12 * oneHour,
      resolutionDate: now + oneDay + 14 * oneHour,
      yesPool: 2.2,
      noPool: 2.4,
      bountyPool: 0.51,
      status: "active",
      createdAt: now - oneHour,
    },
    {
      id: "mbc-wifi-crash",
      question: "Will the WiFi crash during a demo?",
      description:
        "Resolves YES if WiFi connectivity issues visibly interrupt any hackathon demo for more than 30 seconds. The presenter must acknowledge the WiFi issue.",
      deadline: now + oneDay + 10 * oneHour,
      resolutionDate: now + oneDay + 15 * oneHour,
      yesPool: 7.8,
      noPool: 2.1,
      bountyPool: 1.1,
      status: "active",
      createdAt: now - 4 * oneHour,
    },
    {
      id: "mbc-coffee-runs",
      question: "Will there be more than 5 coffee runs today?",
      description:
        "Resolves YES if the group makes more than 5 collective trips to get coffee (Starbucks, local cafe, or any coffee source outside the venue) during hackathon day.",
      deadline: now + 10 * oneHour,
      resolutionDate: now + 16 * oneHour,
      yesPool: 4.0,
      noPool: 1.8,
      bountyPool: 0.64,
      status: "active",
      createdAt: now - 30 * 60 * 1000,
    },
  ];
}
