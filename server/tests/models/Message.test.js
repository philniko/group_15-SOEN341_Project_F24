// tests/models/Message.test.js

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Message from '../../models/Message.js';
import User from '../../models/User.js';

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
  await Message.init();
  await User.init();
});

afterAll(async () => {
  // Close mongoose connection and stop the server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test
  await User.deleteMany({});
  await Message.deleteMany({});
});

afterEach(async () => {
  // Clear collections after each test
  await User.deleteMany({});
  await Message.deleteMany({});
});

describe('Message Model Tests', () => {
  it('should create a message successfully', async () => {
    const sender = await User.create({
      firstName: 'Alice',
      lastName: 'Sender',
      email: `alice.sender+${Date.now()}@example.com`,
      password: 'password123',
    });

    const recipient = await User.create({
      firstName: 'Bob',
      lastName: 'Recipient',
      email: `bob.recipient+${Date.now()}@example.com`,
      password: 'password123',
    });

    const messageData = {
      sender: sender._id,
      recipient: recipient._id,
      message: 'Hello, Bob!',
    };

    const message = await Message.create(messageData);

    expect(message).toBeDefined();
    expect(message.sender.toString()).toBe(sender._id.toString());
    expect(message.recipient.toString()).toBe(recipient._id.toString());
    expect(message.message).toBe('Hello, Bob!');
    expect(message.timestamp).toBeDefined();
  });

  it('should throw validation errors for missing fields', async () => {
    await expect(Message.create({})).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should set timestamp to the current date by default', async () => {
    const sender = await User.create({
      firstName: 'Alice',
      lastName: 'Sender',
      email: `alice.sender+${Date.now()}@example.com`,
      password: 'password123',
    });

    const recipient = await User.create({
      firstName: 'Bob',
      lastName: 'Recipient',
      email: `bob.recipient+${Date.now()}@example.com`,
      password: 'password123',
    });

    const messageData = {
      sender: sender._id,
      recipient: recipient._id,
      message: 'Hello, Bob!',
    };

    const message = await Message.create(messageData);

    expect(message.timestamp).toBeDefined();
    const now = new Date();
    expect(Math.abs(new Date(message.timestamp).getTime() - now.getTime())).toBeLessThan(1000); // Within 1 second
  });

  it('should fetch messages between two users', async () => {
    const sender = await User.create({
      firstName: 'Alice',
      lastName: 'Sender',
      email: `alice.sender+${Date.now()}@example.com`,
      password: 'password123',
    });

    const recipient = await User.create({
      firstName: 'Bob',
      lastName: 'Recipient',
      email: `bob.recipient+${Date.now()}@example.com`,
      password: 'password123',
    });

    await Message.create({ sender: sender._id, recipient: recipient._id, message: 'Hi Bob!' });
    await Message.create({ sender: recipient._id, recipient: sender._id, message: 'Hi Alice!' });

    const messages = await Message.find({
      $or: [
        { sender: sender._id, recipient: recipient._id },
        { sender: recipient._id, recipient: sender._id },
      ],
    }).sort({ timestamp: 1 }); // Ensure consistent ordering

    expect(messages).toHaveLength(2);
    expect(messages[0].message).toBe('Hi Bob!');
    expect(messages[1].message).toBe('Hi Alice!');
  });
});
