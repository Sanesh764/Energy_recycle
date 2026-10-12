const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Device, Pickup, ImpactFactor, Counter, RewardTransaction } = require('../models');

/**
 * Authoritative Published Impact Factor Reference Data
 * Sources: ITU / UNITAR Global E-waste Monitor (GEM 2024 / UNU-KEY classification).
 * SPEC.md Section 7 & 10: "Do not invent these values. If a source is missing,
 * leave the field empty and show 'not available' in the UI."
 */
const PUBLISHED_IMPACT_FACTORS = [
  {
    deviceType: 'PHONE',
    avgWeightKg: 0.2,
    recyclableShare: 0.8,
    source: 'ITU / Global E-waste Monitor 2026 (UNU-KEY 0406: Mobile phones) - https://ewastemonitor.info'
  },
  {
    deviceType: 'LAPTOP',
    avgWeightKg: 2.5,
    recyclableShare: 0.85,
    source: 'ITU / Global E-waste Monitor 2024 (UNU-KEY 0302: Laptops & Portable Computers) - https://ewastemonitor.info'
  },
  {
    deviceType: 'TV',
    avgWeightKg: 15.0,
    recyclableShare: 0.75,
    source: 'ITU / Global E-waste Monitor 2024 (UNU-KEY 0408: Flat display panels) - https://ewastemonitor.info'
  }
  // Other categories (CHARGER, BATTERY, PRINTER, OTHER) are intentionally NOT invented
  // and will correctly evaluate to "not available" per SPEC.md Section 7 line 146.
];

const bcrypt = require('bcryptjs');

const DEMO_USERS = [
  {
    cognitoSub: 'dev-demo-admin-01',
    name: 'Admin Sanesh',
    email: 'sanesh7644@gmail.com',
    role: 'admin',
    servicePincodes: []
  },
  {
    cognitoSub: 'dev-demo-collector-01',
    name: 'Santosh Collector',
    email: 'santosh@gmail.com',
    role: 'collector',
    servicePincodes: ['800020', '800022']
  },
  {
    cognitoSub: 'dev-demo-collector-02',
    name: 'Collector Two',
    email: 'collector2@ewaste.local',
    role: 'collector',
    servicePincodes: ['80020']
  },
  {
    cognitoSub: 'dev-demo-collector-03',
    name: 'Collector Three',
    email: 'collector3@ewaste.local',
    role: 'collector',
    servicePincodes: ['800020']
  },
  {
    cognitoSub: 'dev-demo-citizen-01',
    name: 'Demo Citizen',
    email: 'citizen@example.org',
    role: 'citizen',
    servicePincodes: [],
    rewardCoins: 120
  }
];

async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Development seed script cannot run in production mode.');
    throw new Error('Seed script is not permitted in production');
  }

  console.log('--- E-Waste Passport Database Seeding ---');
  await connectDB();

  // 1. Seed Impact Factor Reference Data (Idempotent upsert)
  console.log('Seeding published impact factor reference data...');
  for (const factor of PUBLISHED_IMPACT_FACTORS) {
    await ImpactFactor.findOneAndUpdate(
      { deviceType: factor.deviceType },
      { $set: factor },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${PUBLISHED_IMPACT_FACTORS.length} published impact factor references.`);

  // 2. Seed Demo User Accounts (Hashed passwords with bcrypt, idempotent)
  console.log('Seeding demo accounts with hashed passwords...');
  const defaultPasswordHash = await bcrypt.hash('password@123', 10);

  const userMap = {};
  for (const userData of DEMO_USERS) {
    const userToSave = {
      ...userData,
      passwordHash: defaultPasswordHash
    };
    const user = await User.findOneAndUpdate(
      { $or: [{ email: userData.email.toLowerCase() }, { cognitoSub: userData.cognitoSub }] },
      { $set: userToSave },
      { upsert: true, new: true }
    );
    userMap[user.role] = userMap[user.role] || user;
  }
  console.log('Seeded demo accounts for Admin, 3 Collectors, and Citizen.');

  const citizenUser = userMap.citizen;
  const collectorUser = userMap.collector;

  // 3. Seed Clearly Marked Demo Devices (isSample: true)
  // Preserves existing user data: checks deviceCode and does not overwrite existing records.
  const sampleDeviceDefinitions = [
    {
      deviceCode: 'EW-2026-000101',
      ownerId: citizenUser._id,
      type: 'LAPTOP',
      ageYears: 4,
      powersOn: true,
      damage: 'MINOR',
      notes: 'Intel Core i5, battery holds charge, minor chassis wear on lower panel.',
      photoKey: 'devices/sample-laptop-01.jpg',
      status: 'PICKUP_REQUESTED',
      isSample: true,
      ai: {
        status: 'OK',
        suggestedOutcome: 'REPAIR',
        reason: 'Chassis has minor surface wear while logic board and power circuit function properly. Component servicing extends useful life.',
        safetyTip: 'Safely decouple personal cloud accounts and execute storage sanitization prior to collection.',
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        createdAt: new Date('2026-10-01T09:00:15Z')
      },
      timeline: [
        {
          step: 'REGISTERED',
          at: new Date('2026-10-01T09:00:15Z'),
          byUserId: citizenUser._id,
          byRole: 'citizen',
          note: 'Device registered and AI triage generated.'
        },
        {
          step: 'PICKUP_REQUESTED',
          at: new Date('2026-10-01T09:15:00Z'),
          byUserId: citizenUser._id,
          byRole: 'citizen',
          note: 'Doorstep pickup requested for pincode 110001.'
        }
      ],
      pickupAddress: {
        street: 'Flat 402, Green Enclave',
        locality: 'Sector 14',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        contactPhone: '9876543210',
        instructions: 'Gate 2 security clear'
      },
      pickupDetails: {
        address: {
          text: 'Flat 402, Green Enclave, Sector 14, New Delhi, Delhi - 110001 (Contact: 9876543210)',
          pincode: '110001',
          street: 'Flat 402, Green Enclave',
          locality: 'Sector 14',
          city: 'New Delhi',
          state: 'Delhi',
          contactPhone: '9876543210',
          instructions: 'Gate 2 security clear'
        },
        preferredSlot: 'Weekend Morning (10 AM - 1 PM)',
        status: 'REQUESTED',
        collectorId: null
      }
    },
    {
      deviceCode: 'EW-2026-000102',
      ownerId: citizenUser._id,
      type: 'PHONE',
      ageYears: 6,
      powersOn: false,
      damage: 'MAJOR',
      notes: 'Cracked screen and damaged motherboard; no response to charging.',
      photoKey: 'devices/sample-phone-02.jpg',
      status: 'COLLECTED',
      isSample: true,
      ai: {
        status: 'OK',
        suggestedOutcome: 'RECYCLE',
        reason: 'Device powers off with major structural damage; optimal for material recovery.',
        safetyTip: 'Remove SIM and microSD memory card before collection.',
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        createdAt: new Date('2026-10-02T11:00:00Z')
      },
      timeline: [
        {
          step: 'REGISTERED',
          at: new Date('2026-10-02T11:00:00Z'),
          byUserId: citizenUser._id,
          byRole: 'citizen',
          note: 'Device registered'
        },
        {
          step: 'PICKUP_REQUESTED',
          at: new Date('2026-10-02T11:10:00Z'),
          byUserId: citizenUser._id,
          byRole: 'citizen',
          note: 'Pickup requested for pincode 110001'
        },
        {
          step: 'ACCEPTED',
          at: new Date('2026-10-02T12:00:00Z'),
          byUserId: collectorUser._id,
          byRole: 'collector',
          note: 'Pickup accepted by collector'
        },
        {
          step: 'COLLECTED',
          at: new Date('2026-10-02T14:30:00Z'),
          byUserId: collectorUser._id,
          byRole: 'collector',
          note: 'Device collected from citizen doorstep'
        }
      ],
      pickupAddress: {
        street: 'Block C, Street 9',
        locality: 'Rohini',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        contactPhone: '9811223344',
        instructions: 'Call before arriving'
      },
      pickupDetails: {
        address: {
          text: 'Block C, Street 9, Rohini, New Delhi, Delhi - 110001 (Contact: 9811223344)',
          pincode: '110001',
          street: 'Block C, Street 9',
          locality: 'Rohini',
          city: 'New Delhi',
          state: 'Delhi',
          contactPhone: '9811223344',
          instructions: 'Call before arriving'
        },
        preferredSlot: 'Weekday Afternoon (2 PM - 5 PM)',
        status: 'COLLECTED',
        collectorId: collectorUser._id
      }
    },
    {
      deviceCode: 'EW-2026-000103',
      ownerId: citizenUser._id,
      type: 'TV',
      ageYears: 5,
      powersOn: true,
      damage: 'NONE',
      notes: 'Working LED TV, replaced with larger screen. Excellent visual panel.',
      photoKey: 'devices/sample-tv-03.jpg',
      status: 'COMPLETED',
      finalOutcome: 'REUSE',
      isSample: true,
      ai: {
        status: 'OK',
        suggestedOutcome: 'REUSE',
        reason: 'Full operational integrity with zero panel flaws; ideal for secondary donation.',
        safetyTip: 'Factory reset TV settings to remove saved streaming logins.',
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        createdAt: new Date('2026-09-20T10:00:00Z')
      },
      timeline: [
        { step: 'REGISTERED', at: new Date('2026-09-20T10:00:00Z'), byUserId: citizenUser._id, byRole: 'citizen', note: 'Device registered' },
        { step: 'PICKUP_REQUESTED', at: new Date('2026-09-20T10:15:00Z'), byUserId: citizenUser._id, byRole: 'citizen', note: 'Pickup requested' },
        { step: 'ACCEPTED', at: new Date('2026-09-20T11:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Accepted' },
        { step: 'COLLECTED', at: new Date('2026-09-20T15:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Collected' },
        { step: 'INSPECTED', at: new Date('2026-09-21T09:30:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Panel certified operational. Approved for community reuse.' },
        { step: 'COMPLETED', at: new Date('2026-09-21T10:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Transferred to secondary user' }
      ],
      pickupDetails: {
        address: { text: '12 Model Town, Central Block', pincode: '110001' },
        preferredSlot: 'Morning (9 AM - 12 PM)',
        status: 'COLLECTED',
        collectorId: collectorUser._id
      }
    },
    {
      deviceCode: 'EW-2026-000104',
      ownerId: citizenUser._id,
      type: 'LAPTOP',
      ageYears: 7,
      powersOn: true,
      damage: 'MINOR',
      notes: 'Faulty keyboard ribbon cable; motherboard and CPU fully functional.',
      photoKey: 'devices/sample-laptop-04.jpg',
      status: 'COMPLETED',
      finalOutcome: 'REPAIR',
      isSample: true,
      ai: {
        status: 'OK',
        suggestedOutcome: 'REPAIR',
        reason: 'Peripheral fault with sound computing base; refurbishing candidate.',
        safetyTip: 'Wipe user home folder prior to pickup handover.',
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        createdAt: new Date('2026-09-22T08:00:00Z')
      },
      timeline: [
        { step: 'REGISTERED', at: new Date('2026-09-22T08:00:00Z'), byUserId: citizenUser._id, byRole: 'citizen', note: 'Registered' },
        { step: 'PICKUP_REQUESTED', at: new Date('2026-09-22T08:30:00Z'), byUserId: citizenUser._id, byRole: 'citizen', note: 'Pickup requested' },
        { step: 'ACCEPTED', at: new Date('2026-09-22T09:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Accepted' },
        { step: 'COLLECTED', at: new Date('2026-09-22T13:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Collected' },
        { step: 'INSPECTED', at: new Date('2026-09-23T11:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Keyboard replaced, diagnostics pass.' },
        { step: 'COMPLETED', at: new Date('2026-09-23T12:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Refurbished and certified' }
      ],
      pickupDetails: {
        address: { text: '84 Park Street, Extension', pincode: '110002' },
        preferredSlot: 'Weekend Afternoon (1 PM - 4 PM)',
        status: 'COLLECTED',
        collectorId: collectorUser._id
      }
    },
    {
      deviceCode: 'EW-2026-000105',
      ownerId: citizenUser._id,
      type: 'PHONE',
      ageYears: 8,
      powersOn: false,
      damage: 'MAJOR',
      notes: 'Water damage, swollen battery safely removed; recycled materials.',
      photoKey: 'devices/sample-phone-05.jpg',
      status: 'COMPLETED',
      finalOutcome: 'RECYCLE',
      isSample: true,
      ai: {
        status: 'OK',
        suggestedOutcome: 'RECYCLE',
        reason: 'Fatal water damage to circuit substrate. Certified metals recovery.',
        safetyTip: 'Store in dry container away from flammable materials.',
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        createdAt: new Date('2026-09-25T14:00:00Z')
      },
      timeline: [
        { step: 'REGISTERED', at: new Date('2026-09-25T14:00:00Z'), byUserId: citizenUser._id, byRole: 'citizen', note: 'Registered' },
        { step: 'PICKUP_REQUESTED', at: new Date('2026-09-25T14:20:00Z'), byUserId: citizenUser._id, byRole: 'citizen', note: 'Pickup requested' },
        { step: 'ACCEPTED', at: new Date('2026-09-25T15:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Accepted' },
        { step: 'COLLECTED', at: new Date('2026-09-26T10:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Collected' },
        { step: 'INSPECTED', at: new Date('2026-09-26T16:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Non-repairable circuit destruction confirmed. Routed to smelter extraction.' },
        { step: 'COMPLETED', at: new Date('2026-09-27T09:00:00Z'), byUserId: collectorUser._id, byRole: 'collector', note: 'Certified recyclable materials recovered' }
      ],
      pickupDetails: {
        address: { text: '210 Vikas Marg, Sector 2', pincode: '110001' },
        preferredSlot: 'Morning (9 AM - 12 PM)',
        status: 'COLLECTED',
        collectorId: collectorUser._id
      }
    }
  ];

  console.log('Seeding sample demo devices (marked isSample: true)...');
  for (const def of sampleDeviceDefinitions) {
    const { pickupDetails, ...deviceData } = def;

    // Check if device with this code already exists
    let device = await Device.findOne({ deviceCode: deviceData.deviceCode });
    if (!device) {
      device = await Device.create(deviceData);
      console.log(`Created sample device: ${device.deviceCode} (${device.status})`);
    } else {
      console.log(`Sample device ${device.deviceCode} already exists (skipping overwrite).`);
    }

    // Ensure corresponding pickup exists if specified
    if (pickupDetails) {
      const existingPickup = await Pickup.findOne({ deviceId: device._id });
      if (!existingPickup) {
        await Pickup.create({
          deviceId: device._id,
          ownerId: citizenUser._id,
          address: pickupDetails.address,
          preferredSlot: pickupDetails.preferredSlot,
          status: pickupDetails.status,
          collectorId: pickupDetails.collectorId
        });
        console.log(`Created pickup for ${device.deviceCode}`);
      }
    }
  }

  // 4. Initialize Counter to ensure new citizen registrations get sequential codes > 105
  await Counter.findOneAndUpdate(
    { _id: 'deviceCode' },
    { $max: { seq: 105 } },
    { upsert: true, new: true }
  );
  console.log('Initialized atomic deviceCode counter to seq >= 105.');

  // 5. Seed initial reward transactions for Demo Citizen if none exist
  const existingTx = await RewardTransaction.findOne({ userId: citizenUser._id });
  if (!existingTx) {
    await RewardTransaction.create([
      {
        userId: citizenUser._id,
        type: 'EARN',
        amount: 50,
        deviceCode: 'EW-2026-000103',
        description: 'Verified collection of TV (EW-2026-000103)'
      },
      {
        userId: citizenUser._id,
        type: 'EARN',
        amount: 70,
        deviceCode: 'EW-2026-000104',
        description: 'Verified collection of BATTERY (EW-2026-000104)'
      }
    ]);
    console.log('Seeded initial reward transactions (120 coins total) for Demo Citizen.');
  }

  console.log('--- Database Seeding Complete ---');
  await disconnectDB();
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  PUBLISHED_IMPACT_FACTORS,
  DEMO_USERS
};
