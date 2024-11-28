// tests/models/Group.test.js

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Group from '../../models/Group.js';
import User from '../../models/User.js';
import Ratings from '../../models/Ratings.js';
import Course from '../../models/Course.js';

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect mongoose to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Ensure indexes are created
  await Group.init();
  await User.init();
  await Ratings.init();
  await Course.init();
});

afterAll(async () => {
  // Close mongoose connection and stop the server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test
  await User.deleteMany({});
  await Group.deleteMany({});
  await Course.deleteMany({});
});

afterEach(async () => {
  // Clear collections after each test
  await User.deleteMany({});
  await Group.deleteMany({});
  await Course.deleteMany({});
});

describe('Group Model Tests', () => {
  it('should create a group successfully', async () => {
    const instructor = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe+${Date.now()}@example.com`,
      password: 'password123',
    });

    const groupData = {
      name: 'Team Alpha',
      instructor: instructor._id,
    };

    const group = await Group.create(groupData);

    expect(group).toBeDefined();
    expect(group.name).toBe(groupData.name);
    expect(group.instructor.toString()).toBe(instructor._id.toString());
  });

  it('should validate required fields', async () => {
    const groupData = { name: 'Team Alpha' };

    await expect(Group.create(groupData)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('should reference valid ObjectIds', async () => {
    const invalidId = '1234';

    await expect(
      Group.create({ name: 'Team Beta', instructor: invalidId })
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should add messages to the group', async () => {
    const instructor = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: `jane.doe+${Date.now()}@example.com`,
      password: 'password123',
    });

    const group = await Group.create({
      name: 'Team Gamma',
      instructor: instructor._id,
    });

    group.messages.push({
      sender: 'instructor',
      name: 'Jane Doe',
      message: 'Welcome to the group!',
    });

    await group.save();

    const updatedGroup = await Group.findById(group._id);

    expect(updatedGroup.messages).toHaveLength(1);
    expect(updatedGroup.messages[0].message).toBe('Welcome to the group!');
  });

  it('should not allow duplicate students in the group', async () => {
    const instructor = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: `jane.doe+${Date.now()}@example.com`,
      password: 'password123',
    });
    const student = await User.create({
      firstName: 'Bob',
      lastName: 'Brown',
      email: `bob.brown+${Date.now()}@example.com`,
      password: 'password123',
    });

    const group = await Group.create({
      name: 'Team Echo',
      instructor: instructor._id,
    });

    group.students.push(student._id);
    group.students.push(student._id);

    // Deduplicate before saving
    group.students = [...new Set(group.students.map((id) => id.toString()))];
    await group.save();

    const updatedGroup = await Group.findById(group._id);

    expect(updatedGroup.students).toHaveLength(1);
  });

  it('should fetch groups by instructor', async () => {
    const instructor = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: `jane.doe+${Date.now()}@example.com`,
      password: 'password123',
    });

    await Group.create({ name: 'Team Zeta', instructor: instructor._id });
    await Group.create({ name: 'Team Eta', instructor: instructor._id });

    const groups = await Group.find({ instructor: instructor._id }).sort({
      name: 1,
    });

    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('Team Eta');
    expect(groups[1].name).toBe('Team Zeta');
  });
});
