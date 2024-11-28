// tests/models/User.test.js

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await User.init(); // Ensure indexes are created
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model Tests', () => {
  it('should create a user successfully', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    const user = new User(userData);
    await user.save();

    const foundUser = await User.findOne({ email: 'john.doe@example.com' });

    expect(foundUser).toBeDefined();
    expect(foundUser.email).toStrictEqual(userData.email);
  });

  it('should hash the password before saving', async () => {
    const userData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'mypassword',
    };

    const user = new User(userData);
    await user.save();

    const foundUser = await User.findOne({ email: 'jane.smith@example.com' });
    expect(foundUser.password).not.toBe(userData.password);
    expect(await bcrypt.compare('mypassword', foundUser.password)).toBe(true);
  });

  it('should validate required fields', async () => {
    const user = new User({});

    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should enforce valid ObjectId for groups', async () => {
    const validUser = new User({
      firstName: 'Valid',
      lastName: 'Group',
      email: 'valid.group@example.com',
      password: 'password123',
      groups: [new mongoose.Types.ObjectId()],
    });

    await expect(validUser.save()).resolves.not.toThrow();

    const invalidUser = new User({
      firstName: 'Invalid',
      lastName: 'Group',
      email: 'invalid.group@example.com',
      password: 'password123',
      groups: ['invalidObjectId'],
    });

    await expect(invalidUser.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should generate a valid JWT token', async () => {
    const userData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password123',
      role: 'student',
    };

    const user = new User(userData);
    await user.save();

    const token = jwt.sign(
      {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      'secret',
      { expiresIn: '1h' }
    );

    const decoded = jwt.verify(token, 'secret');

    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(user._id.toString());
    expect(decoded.firstName).toBe(user.firstName);
    expect(decoded.lastName).toBe(user.lastName);
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
  });
});
