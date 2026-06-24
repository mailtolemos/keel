import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const DAY = 86400000;
const d = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY);
const ymd = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));

async function main() {
  // Clean slate (order matters for FKs)
  await db.goalUpdate.deleteMany();
  await db.goal.deleteMany();
  await db.oneOnOneNote.deleteMany();
  await db.oneOnOne.deleteMany();
  await db.feedback.deleteMany();
  await db.reviewResponse.deleteMany();
  await db.cycleParticipant.deleteMany();
  await db.reviewQuestion.deleteMany();
  await db.reviewCycle.deleteMany();
  await db.leaveRequest.deleteMany();
  await db.leavePolicy.deleteMany();
  await db.holiday.deleteMany();
  await db.invitation.deleteMany();
  await db.membership.deleteMany();
  await db.employee.deleteMany();
  await db.team.deleteMany();
  await db.user.deleteMany();
  await db.changelog.deleteMany();
  await db.company.deleteMany();

  const pw = await bcrypt.hash("password", 10);

  const company = await db.company.create({
    data: {
      name: "Lumen",
      slug: "lumen",
      country: "United States",
      workWeek: "Mon,Tue,Wed,Thu,Fri",
      accentColor: "#4E2BD6",
      subscriptionStatus: "active",
      plan: "pro"
    }
  });

  // ---- Leave policies ----
  await db.leavePolicy.createMany({
    data: [
      { companyId: company.id, name: "Vacation", type: "VACATION", allowanceDays: 25, paid: true },
      { companyId: company.id, name: "Sick leave", type: "SICK", allowanceDays: 10, paid: true },
      { companyId: company.id, name: "Parental leave", type: "PARENTAL", allowanceDays: 90, paid: true },
      { companyId: company.id, name: "Unpaid leave", type: "UNPAID", allowanceDays: 0, paid: false }
    ]
  });

  // ---- Holidays (US 2026, upcoming subset) ----
  await db.holiday.createMany({
    data: [
      { companyId: company.id, name: "Independence Day", date: ymd(2026, 7, 3), calendar: "US Public" },
      { companyId: company.id, name: "Labor Day", date: ymd(2026, 9, 7), calendar: "US Public" },
      { companyId: company.id, name: "Thanksgiving", date: ymd(2026, 11, 26), calendar: "US Public" },
      { companyId: company.id, name: "Day after Thanksgiving", date: ymd(2026, 11, 27), calendar: "Company" },
      { companyId: company.id, name: "Winter Break", date: ymd(2026, 12, 24), calendar: "Company" },
      { companyId: company.id, name: "Christmas Day", date: ymd(2026, 12, 25), calendar: "US Public" },
      { companyId: company.id, name: "New Year's Day", date: ymd(2027, 1, 1), calendar: "US Public" }
    ]
  });

  // ---- Teams ----
  const eng = await db.team.create({ data: { companyId: company.id, name: "Engineering", description: "Builds and runs the Lumen platform." } });
  const product = await db.team.create({ data: { companyId: company.id, name: "Product", description: "Defines what we build and why." } });
  const design = await db.team.create({ data: { companyId: company.id, name: "Design", description: "Craft, brand, and product experience." } });
  const gtm = await db.team.create({ data: { companyId: company.id, name: "Go-to-Market", description: "Sales, marketing, and growth." } });
  const ops = await db.team.create({ data: { companyId: company.id, name: "Operations", description: "People, finance, and the back office." } });

  type Spec = {
    name: string; title: string; email: string; role: "ADMIN" | "MANAGER" | "EMPLOYEE";
    teamId: string; location: string; type?: string; start: Date; manager?: string; status?: string; birthday?: Date;
  };
  const specs: Spec[] = [
    { name: "Alex Rivera", title: "Co-founder & CEO", email: "alex@lumen.co", role: "ADMIN", teamId: ops.id, location: "San Francisco, US", start: ymd(2022, 1, 10), birthday: ymd(1988, 4, 12) },
    { name: "Priya Nair", title: "Head of People", email: "priya@lumen.co", role: "ADMIN", teamId: ops.id, location: "San Francisco, US", start: ymd(2022, 3, 1), manager: "alex@lumen.co", birthday: ymd(1990, 9, 3) },
    { name: "Marcus Lee", title: "VP Engineering", email: "marcus@lumen.co", role: "MANAGER", teamId: eng.id, location: "Remote, US", start: ymd(2022, 2, 14), manager: "alex@lumen.co" },
    { name: "Sofia Alvarez", title: "Head of Product", email: "sofia@lumen.co", role: "MANAGER", teamId: product.id, location: "New York, US", start: ymd(2022, 5, 2), manager: "alex@lumen.co" },
    { name: "Dan Whitfield", title: "Design Lead", email: "dan@lumen.co", role: "MANAGER", teamId: design.id, location: "Austin, US", start: ymd(2022, 6, 20), manager: "alex@lumen.co" },
    { name: "Hannah Park", title: "Head of GTM", email: "hannah@lumen.co", role: "MANAGER", teamId: gtm.id, location: "Chicago, US", start: ymd(2022, 8, 8), manager: "alex@lumen.co" },
    { name: "Tomás Costa", title: "Senior Engineer", email: "tomas@lumen.co", role: "EMPLOYEE", teamId: eng.id, location: "Lisbon, PT", start: ymd(2023, 1, 16), manager: "marcus@lumen.co", birthday: ymd(1992, 6, 22) },
    { name: "Wei Chen", title: "Backend Engineer", email: "wei@lumen.co", role: "EMPLOYEE", teamId: eng.id, location: "Remote, US", start: ymd(2023, 4, 3), manager: "marcus@lumen.co" },
    { name: "Grace Okoro", title: "Frontend Engineer", email: "grace@lumen.co", role: "EMPLOYEE", teamId: eng.id, location: "London, UK", start: ymd(2023, 9, 11), manager: "marcus@lumen.co" },
    { name: "Liam Murphy", title: "Product Manager", email: "liam@lumen.co", role: "EMPLOYEE", teamId: product.id, location: "Dublin, IE", start: ymd(2023, 2, 27), manager: "sofia@lumen.co" },
    { name: "Nadia Hassan", title: "Product Designer", email: "nadia@lumen.co", role: "EMPLOYEE", teamId: design.id, location: "Berlin, DE", start: ymd(2023, 7, 5), manager: "dan@lumen.co" },
    { name: "Jordan Blake", title: "Account Executive", email: "jordan@lumen.co", role: "EMPLOYEE", teamId: gtm.id, location: "Chicago, US", start: ymd(2024, 1, 8), manager: "hannah@lumen.co" },
    { name: "Mei Tanaka", title: "Growth Marketer", email: "mei@lumen.co", role: "EMPLOYEE", teamId: gtm.id, location: "Remote, US", start: ymd(2024, 3, 18), manager: "hannah@lumen.co", status: "OFFBOARDING" },
    { name: "Carlos Mendes", title: "People Ops Coordinator", email: "carlos@lumen.co", role: "EMPLOYEE", teamId: ops.id, location: "San Francisco, US", start: ymd(2024, 6, 24), manager: "priya@lumen.co" }
  ];

  // Create users + employees
  const byEmail: Record<string, string> = {}; // email -> employeeId
  for (const s of specs) {
    const user = await db.user.create({
      data: { email: s.email, name: s.name, passwordHash: pw }
    });
    const emp = await db.employee.create({
      data: {
        companyId: company.id,
        userId: user.id,
        name: s.name,
        title: s.title,
        workEmail: s.email,
        location: s.location,
        employmentType: s.type ?? "Full-time",
        startDate: s.start,
        birthday: s.birthday ?? null,
        role: s.role,
        status: s.status ?? "ACTIVE",
        teamId: s.teamId,
        adminNotes: s.role === "EMPLOYEE" ? "Strong performer. Discussed growth path in last 1:1." : null
      }
    });
    byEmail[s.email] = emp.id;
  }
  // Operator: Alex is the platform admin who provisions companies
  await db.user.update({ where: { email: "alex@lumen.co" }, data: { isPlatformAdmin: true } });

  // Set managers (second pass)
  for (const s of specs) {
    if (s.manager) {
      await db.employee.update({ where: { id: byEmail[s.email] }, data: { managerId: byEmail[s.manager] } });
    }
  }
  // Team leads
  await db.team.update({ where: { id: eng.id }, data: { leadId: byEmail["marcus@lumen.co"] } });
  await db.team.update({ where: { id: product.id }, data: { leadId: byEmail["sofia@lumen.co"] } });
  await db.team.update({ where: { id: design.id }, data: { leadId: byEmail["dan@lumen.co"] } });
  await db.team.update({ where: { id: gtm.id }, data: { leadId: byEmail["hannah@lumen.co"] } });
  await db.team.update({ where: { id: ops.id }, data: { leadId: byEmail["priya@lumen.co"] } });

  // Memberships mirror primary team
  for (const s of specs) {
    await db.membership.create({ data: { employeeId: byEmail[s.email], teamId: s.teamId, title: s.title } });
  }

  // ---- Leave requests ----
  await db.leaveRequest.createMany({
    data: [
      { employeeId: byEmail["tomas@lumen.co"], type: "VACATION", startDate: d(7), endDate: d(11), days: 5, reason: "Family trip to the Algarve", status: "PENDING" },
      { employeeId: byEmail["grace@lumen.co"], type: "SICK", startDate: d(1), endDate: d(1), days: 1, reason: "Doctor's appointment", status: "PENDING" },
      { employeeId: byEmail["liam@lumen.co"], type: "VACATION", startDate: d(21), endDate: d(25), days: 5, reason: "Holiday", status: "PENDING", },
      { employeeId: byEmail["wei@lumen.co"], type: "VACATION", startDate: d(-30), endDate: d(-26), days: 5, status: "APPROVED", approverId: byEmail["marcus@lumen.co"], decidedAt: d(-35) },
      { employeeId: byEmail["nadia@lumen.co"], type: "PARENTAL", startDate: d(40), endDate: d(130), days: 65, reason: "Parental leave", status: "APPROVED", approverId: byEmail["dan@lumen.co"], decidedAt: d(-5) },
      { employeeId: byEmail["jordan@lumen.co"], type: "VACATION", startDate: d(3), endDate: d(4), days: 2, status: "APPROVED", approverId: byEmail["hannah@lumen.co"], decidedAt: d(-2) }
    ]
  });

  // ---- Review cycle (active) ----
  const cycle = await db.reviewCycle.create({
    data: {
      companyId: company.id,
      name: "H1 2026 Performance Review",
      periodStart: ymd(2026, 1, 1),
      periodEnd: ymd(2026, 6, 30),
      dueDate: d(14),
      selfReview: true, managerReview: true, peerReview: true, upwardReview: false,
      ratingScale: true, status: "ACTIVE"
    }
  });
  const qPrompts = [
    "What were your most significant accomplishments this period?",
    "Where did you grow the most, and where do you want to grow next?",
    "How well did you collaborate with and support your teammates?",
    "What should you start, stop, or continue doing next period?"
  ];
  const questions: { id: string; prompt: string; order: number; hasRating: boolean }[] = [];
  for (let i = 0; i < qPrompts.length; i++) {
    questions.push(await db.reviewQuestion.create({ data: { cycleId: cycle.id, prompt: qPrompts[i], order: i, hasRating: i < 3 } }));
  }
  const participants = ["tomas@lumen.co", "wei@lumen.co", "grace@lumen.co", "liam@lumen.co", "nadia@lumen.co", "jordan@lumen.co"];
  for (const e of participants) {
    await db.cycleParticipant.create({ data: { cycleId: cycle.id, employeeId: byEmail[e] } });
  }
  // A couple of submitted self-reviews + one manager review
  const ans = (texts: string[], ratings: (number | null)[]) =>
    JSON.stringify(questions.map((q, i) => ({ questionId: q.id, text: texts[i] ?? "", rating: ratings[i] ?? null })));

  await db.reviewResponse.create({
    data: {
      cycleId: cycle.id, kind: "SELF", authorId: byEmail["tomas@lumen.co"], subjectId: byEmail["tomas@lumen.co"],
      status: "SUBMITTED", overallRating: 4, submittedAt: d(-3),
      summary: "Led the billing migration and mentored two new engineers.",
      answers: ans(
        ["Shipped the billing migration ahead of schedule and reduced failed payments by 30%.",
         "Grew in systems design; next I want to deepen my work on reliability.",
         "Paired frequently and ran the onboarding for Wei and Grace.",
         "Continue mentoring; start writing more design docs before building."],
        [4, 4, 5, null])
    }
  });
  await db.reviewResponse.create({
    data: {
      cycleId: cycle.id, kind: "SELF", authorId: byEmail["grace@lumen.co"], subjectId: byEmail["grace@lumen.co"],
      status: "IN_PROGRESS",
      answers: ans(["Rebuilt the dashboard UI and improved load time.", "", "", ""], [4, null, null, null])
    }
  });
  await db.reviewResponse.create({
    data: {
      cycleId: cycle.id, kind: "MANAGER", authorId: byEmail["marcus@lumen.co"], subjectId: byEmail["tomas@lumen.co"],
      status: "SUBMITTED", overallRating: 5, submittedAt: d(-1),
      summary: "Tomás is a force multiplier on the team — technically excellent and a great mentor.",
      growth: "Ready for a tech lead track. Give him ownership of the reliability roadmap next half.",
      answers: ans(
        ["The billing migration was flawless and high-impact.",
         "Strong growth in leadership and systems thinking.",
         "Sets the bar for collaboration on Engineering.",
         "Start delegating more so he can focus on the hardest problems."],
        [5, 5, 5, null])
    }
  });

  // ---- Feedback ----
  const fb = (author: string, subject: string, body: string, tags: string, visibility = "PUBLIC", isRequest = false, daysAgo = 2) =>
    db.feedback.create({ data: { companyId: company.id, authorId: byEmail[author], subjectId: byEmail[subject], body, tags, visibility, isRequest, createdAt: d(-daysAgo) } });
  await fb("marcus@lumen.co", "tomas@lumen.co", "The way you handled the billing cutover at 2am was incredible. Calm, methodical, zero downtime.", "Strength,Execution", "PUBLIC", false, 1);
  await fb("sofia@lumen.co", "liam@lumen.co", "Great job aligning the roadmap with GTM this quarter — the shared doc made it effortless.", "Collaboration,Leadership", "PUBLIC", false, 3);
  await fb("dan@lumen.co", "nadia@lumen.co", "Loved the new onboarding flow mocks. One thought: let's pressure-test the empty states before handoff.", "Improvement,Execution", "PUBLIC", false, 4);
  await fb("hannah@lumen.co", "jordan@lumen.co", "You closed two strategic accounts this month. Keep documenting the playbook so the team can learn from it.", "Strength,Execution", "MANAGER_ONLY", false, 5);
  await fb("priya@lumen.co", "grace@lumen.co", "Could you share feedback on how the eng onboarding felt? Trying to improve it for the next hire.", "Culture", "PRIVATE", true, 1);
  await fb("alex@lumen.co", "hannah@lumen.co", "Your leadership on the pricing relaunch set the tone for the whole company. Thank you.", "Leadership", "PUBLIC", false, 6);

  // ---- Goals ----
  const g1 = await db.goal.create({ data: { companyId: company.id, title: "Reach $5M ARR", description: "Grow annual recurring revenue to $5M by end of year.", level: "COMPANY", ownerId: byEmail["alex@lumen.co"], dueDate: ymd(2026, 12, 31), status: "ON_TRACK", progress: 62 } });
  const g2 = await db.goal.create({ data: { companyId: company.id, title: "Ship the new reviews module", description: "Launch performance reviews to all customers.", level: "TEAM", ownerId: byEmail["sofia@lumen.co"], teamId: product.id, dueDate: d(45), status: "AT_RISK", progress: 40 } });
  const g3 = await db.goal.create({ data: { companyId: company.id, title: "99.95% platform uptime", description: "Improve reliability across core services.", level: "TEAM", ownerId: byEmail["marcus@lumen.co"], teamId: eng.id, dueDate: d(75), status: "ON_TRACK", progress: 78 } });
  const g4 = await db.goal.create({ data: { companyId: company.id, title: "Become a confident tech lead", description: "Own a roadmap area end-to-end and mentor two engineers.", level: "INDIVIDUAL", ownerId: byEmail["tomas@lumen.co"], dueDate: d(120), status: "ON_TRACK", progress: 55 } });
  const g5 = await db.goal.create({ data: { companyId: company.id, title: "Refresh the brand system", description: "Unify product and marketing visual language.", level: "TEAM", ownerId: byEmail["dan@lumen.co"], teamId: design.id, dueDate: d(30), status: "OFF_TRACK", progress: 20 } });
  await db.goalUpdate.create({ data: { goalId: g1.id, authorId: byEmail["alex@lumen.co"], body: "Closed Q2 above plan. Pipeline strong for Q3.", progress: 62, createdAt: d(-4) } });
  await db.goalUpdate.create({ data: { goalId: g2.id, authorId: byEmail["sofia@lumen.co"], body: "Engineering capacity is tight — pulling in a contractor to de-risk the deadline.", progress: 40, createdAt: d(-2) } });
  await db.goalUpdate.create({ data: { goalId: g3.id, authorId: byEmail["marcus@lumen.co"], body: "Rolled out new alerting. Last incident MTTR down to 12 minutes.", progress: 78, createdAt: d(-6) } });

  // ---- 1:1s ----
  const oneOnOne = await db.oneOnOne.create({ data: { managerId: byEmail["marcus@lumen.co"], reportId: byEmail["tomas@lumen.co"], cadence: "Weekly", nextAt: d(2) } });
  await db.oneOnOneNote.create({
    data: {
      oneOnOneId: oneOnOne.id, meetingDate: d(-5),
      agenda: "Reliability roadmap · Career growth · Time off plans",
      sharedNotes: "Agreed Tomás will own the reliability roadmap next half. Discussed tech lead path.",
      actionItems: JSON.stringify([{ text: "Draft reliability roadmap doc", done: false }, { text: "Schedule design review with Wei", done: true }])
    }
  });
  const oneOnOne2 = await db.oneOnOne.create({ data: { managerId: byEmail["sofia@lumen.co"], reportId: byEmail["liam@lumen.co"], cadence: "Weekly", nextAt: d(1) } });
  await db.oneOnOneNote.create({ data: { oneOnOneId: oneOnOne2.id, meetingDate: d(-7), agenda: "Reviews launch · Q3 planning", sharedNotes: "Reviews launch at risk; align with Marcus on capacity.", actionItems: JSON.stringify([{ text: "Sync with Eng on timeline", done: false }]) } });

  // ---- Invitations (pending) ----
  await db.invitation.createMany({
    data: [
      { companyId: company.id, email: "rosa@lumen.co", name: "Rosa Delgado", role: "EMPLOYEE", title: "Customer Success Manager", teamId: gtm.id, status: "PENDING" },
      { companyId: company.id, email: "kenji@lumen.co", name: "Kenji Watanabe", role: "EMPLOYEE", title: "Data Engineer", teamId: eng.id, status: "PENDING" }
    ]
  });

  // ---- A second entity (shows multi-tenant admin) ----
  const douro = await db.company.create({ data: { name: "Douro Labs", slug: "dourolabs", country: "Portugal", workWeek: "Mon,Tue,Wed,Thu,Fri", subscriptionStatus: "active", plan: "pro" } });
  await db.leavePolicy.createMany({ data: [
    { companyId: douro.id, name: "Vacation", type: "VACATION", allowanceDays: 22, paid: true },
    { companyId: douro.id, name: "Sick leave", type: "SICK", allowanceDays: 10, paid: true }
  ]});
  const dTeam = await db.team.create({ data: { companyId: douro.id, name: "Founders" } });
  await db.employee.createMany({ data: [
    { companyId: douro.id, name: "Inês Faria", title: "CEO", workEmail: "ines@dourolabs.pt", role: "ADMIN", status: "ACTIVE", teamId: dTeam.id, location: "Porto, PT", startDate: ymd(2024, 2, 1) },
    { companyId: douro.id, name: "Rui Santos", title: "CTO", workEmail: "rui@dourolabs.pt", role: "MANAGER", status: "ACTIVE", teamId: dTeam.id, location: "Porto, PT", startDate: ymd(2024, 2, 1) },
    { companyId: douro.id, name: "Carla Pinto", title: "Designer", workEmail: "carla@dourolabs.pt", role: "EMPLOYEE", status: "INVITED", teamId: dTeam.id, location: "Lisbon, PT" }
  ]});

  // ---- Product changelog (homepage "what's new") ----
  await db.changelog.createMany({ data: [
    { title: "Multi-workspace platform", category: "Feature", date: d(-1),
      summary: "Keel now runs multiple companies side by side, each at its own mykeel.org/{workspace} address.",
      changes: "Create and manage separate company workspaces from the operator console\nEach company lives at its own URL (e.g. mykeel.org/dourolabs)\nPer-company admins, managers, and employees stay fully isolated" },
    { title: "Performance reviews", category: "Feature", date: d(-9),
      summary: "Run self, manager, and peer review cycles with custom questions and rating scales.",
      changes: "Launch cycles with participants, due dates, and question templates\nSelf and manager reviews with 1–5 ratings\nRelease results to employees when ready" },
    { title: "Continuous feedback", category: "Feature", date: d(-16),
      summary: "Give and request lightweight feedback any time, with tags and visibility controls.",
      changes: "Public praise, manager-only, and private notes\nTags for Strength, Improvement, Collaboration, and more\nRequest feedback from any teammate" },
    { title: "Faster people directory", category: "Improvement", date: d(-23),
      summary: "Search, filter, and the org chart now load instantly even for larger teams.",
      changes: "Instant client-side search and team/status filters\nReporting-line org chart view\nCleaner profile pages with manager-only notes" },
    { title: "Leave approvals polish", category: "Fix", date: d(-31),
      summary: "Fixed balance rounding and tightened the approve/decline flow for managers.",
      changes: "Accurate vacation balance after partial days\nManagers only see their own reports' pending requests\nClearer who's-away calendar" }
  ]});

  console.log("Seed complete: company Lumen with", specs.length, "employees.");
  console.log("Login: alex@lumen.co / password  (Admin)  ·  marcus@lumen.co / password  (Manager)  ·  tomas@lumen.co / password  (Employee)");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
