/*
  Case studies. Architecture patterns are described generically — no internal
  component names, hostnames, or confidential details. Only owner-verified
  metrics appear here.
*/
export const caseStudies = [
  {
    slug: "fuel-dispenser-platform",
    title: "Forecourt payment & IoT platform",
    eyebrow: "7-Eleven · DEX/FuelControl · 2021—present",
    summary:
      "Secure fuel-station automation across major fuel retail brands: EMV payment at the dispenser, edge state machines, and an AWS backbone that keeps a national fleet connected.",
    stack: [
      "Java / Spring Boot",
      "AWS IoT Core",
      "Kinesis",
      "DynamoDB",
      "Lambda",
      "ECS",
      "Node.js",
    ],
    problem: [
      "A fuel dispenser is a payment terminal bolted to a pump on the edge of a retail network. It has to accept EMV card payments, obey fuel-control commands, and report what it dispensed — over links that drop, at sites with decades-old wiring, across hardware from different manufacturers.",
      "Legacy forecourt integrations treated each site as an island: polling-based status checks, manual reconciliation between what the pump dispensed and what the point of sale recorded, and truck-roll troubleshooting when a device went quiet.",
    ],
    constraints: [
      "EMV and PCI certification boundaries fix where card data may flow; the architecture has to work around them, never through them.",
      "Connectivity is intermittent by nature — a site must keep fueling and settle correctly when the link returns.",
      "Dispenser hardware is heterogeneous across brands and generations; the platform speaks to all of it through one contract.",
      "Fuel doesn't stop: rollouts happen against a live national fleet with zero appetite for downtime.",
    ],
    architecture: [
      "At the edge, site controllers run Java/Spring state machines that model each dispenser transaction explicitly — every pump state, payment state, and failure path is a first-class transition, not an exception handler. Events are buffered store-and-forward, so a dropped link degrades to delayed telemetry rather than lost transactions.",
      "Edge devices authenticate to AWS IoT Core over MQTT with per-device identity. Telemetry fans into Kinesis for stream processing; hot state lands in DynamoDB, operational history in MongoDB. Commands flow the other way with explicit acknowledgement and idempotency keys, because a command that might have been applied is worse than one that failed.",
      "Configuration and firmware rollouts move through the same command channel in waves, with per-site health gates — a bad rollout stops itself before it becomes a national incident.",
    ],
    outcome: [
      "The platform runs fuel-station automation across major fuel retail brands in the United States.",
      "Reconciliation between dispensed fuel and recorded transactions became an automated stream instead of a manual back-office task.",
    ],
  },
  {
    slug: "pxe-imaging-station",
    title: "PXE imaging station for payment hardware",
    eyebrow: "Hardware automation · side project turned tool",
    summary:
      "A network-boot provisioning rig that turns hand-imaging payment hardware into a plug-in-and-walk-away process, with custom USB-HID devices standing in for human hands.",
    stack: [
      "PXE / TFTP / DHCP",
      "Linux",
      "Python",
      "Custom USB-HID firmware",
      "Shell",
    ],
    problem: [
      "Payment and kiosk hardware arrives from the vendor generic. Before it can touch a store, each unit needs an OS image, device-specific configuration, and validation — historically a technician with a USB stick, a checklist, and an afternoon.",
      "Manual imaging doesn't scale to fleet refreshes, and every human step is a chance for a unit to reach a site subtly wrong.",
    ],
    constraints: [
      "Target devices are sealed appliances: no spare ports for automation, sometimes no keyboard at all.",
      "The rig has to be operable by non-engineers — success and failure must be legible at a glance.",
      "Images change; the station has to pick the right one from the device's own identity, not an operator's memory.",
    ],
    architecture: [
      "A bench-top station runs the full network-boot chain — DHCP, TFTP, PXE — so a factory-fresh device plugged into the bench boots straight into an imaging environment with no human input. Image selection keys off hardware identity broadcast during boot.",
      "Where devices expect a human at a keyboard, custom USB-HID devices emulate one: purpose-built firmware plays back exact input sequences, turning 'press F12, choose network boot, confirm' into part of the automated chain.",
      "A validation pass runs after imaging and reports pass/fail per unit, so what leaves the bench is known-good, not assumed-good.",
    ],
    outcome: [
      "Provisioning a unit went from a technician-hours task to plug in, wait, unplug.",
      "Every imaged unit passes an identical validation gate before deployment.",
    ],
  },
  {
    slug: "sevenlytravel",
    title: "SevenlyTravel",
    eyebrow: "Founder · travel booking platform",
    summary:
      "A travel-booking product built end to end as founder: React Native app, hotel-supply API integrations, Stripe payments, and AWS hosting — every layer from checkout UX to infrastructure cost.",
    stack: [
      "React Native / Expo",
      "Node.js",
      "Stripe",
      "Hotel-supply APIs",
      "AWS CloudFront / S3 / ECS",
    ],
    problem: [
      "Travel booking is a solved problem for giants and a brutal one for everyone else: inventory lives in third-party supply APIs with their own latency, correctness quirks, and rate limits, while customers expect instant search and airtight payment handling.",
      "As a founder, the constraint set is different from big-company work: every architectural choice is also a cost, support, and velocity choice.",
    ],
    constraints: [
      "Hotel-supply APIs are the source of truth for price and availability — and they disagree with themselves between search and checkout.",
      "Payments must be correct under every failure: a customer charged without a confirmed booking is an unacceptable state.",
      "A tiny team: the architecture has to be operable by the people who built it, in their spare cycles.",
    ],
    architecture: [
      "An Expo/React Native front end ships one codebase to both app stores. Search fans out to supply APIs through a Node.js aggregation layer that normalizes inventory into one internal shape and caches aggressively where supplier terms allow.",
      "Booking is a two-phase flow: price re-verification against the supplier immediately before capture, with Stripe payment intents held until the supplier confirms — so the failure mode is 'booking didn't happen', never 'charged without a room'.",
      "Static assets and the web surface ride CloudFront/S3; the API layer runs on ECS, sized for a startup's traffic rather than an enterprise's budget.",
    ],
    outcome: [
      "Shipped as a working product with live supplier inventory and real payment flows, run by a founding team.",
    ],
  },
  {
    slug: "fleet-observability",
    title: "Fleet observability & silent-device detection",
    eyebrow: "7-Eleven · telemetry & monitoring",
    summary:
      "Turning a national fleet of edge devices into something you can see: structured metrics from every site, and alarms designed around the hardest signal in IoT — silence.",
    stack: [
      "CloudWatch EMF",
      "CloudWatch Alarms",
      "Lambda",
      "Kinesis",
      "Java",
      "Node.js",
    ],
    problem: [
      "The most dangerous failure in an IoT fleet isn't an error — it's silence. A device that crashes loudly pages someone; a device that quietly stops reporting looks identical to a device with nothing to say.",
      "With thousands of edge devices, per-site dashboards built by hand don't scale, and 'is the fleet healthy?' had no single answer.",
    ],
    constraints: [
      "Edge devices already run at the limit of their link budget — observability can't meaningfully increase what they transmit.",
      "Alert fatigue is the failure mode of monitoring: every alarm added must be one a human should act on.",
      "Metrics must be queryable per site, per device type, and fleet-wide without maintaining three systems.",
    ],
    architecture: [
      "Services emit CloudWatch Embedded Metric Format from the telemetry they already process — structured metrics ride the existing log pipeline, so instrumentation costs a log line, not a new agent on constrained devices.",
      "Silent-device detection inverts the usual alarm: instead of alerting on bad values, heartbeat-expectation alarms fire on the absence of expected telemetry, scoped so one dead site link reads as one incident, not hundreds of device alarms.",
      "Dashboards are generated from fleet metadata rather than built per site — a new site is observable the day it comes online.",
    ],
    outcome: [
      "Silent failures surface as first-class incidents instead of being discovered by store staff or reconciliation gaps.",
      "Usage-pattern baselines feed proactive maintenance alerts for dispensers and tank gauges — published as peer-reviewed work.",
    ],
  },
];
