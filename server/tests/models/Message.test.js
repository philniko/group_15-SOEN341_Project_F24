import mongoose from 'mongoose';
import Message from '../../models/Message';
import User from '../../models/User';

beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/testdb'
    await mongoose.connect(mongoURI);
});

beforeEach(async () => {
    await User.deleteMany({});
    await Message.deleteMany({});
    await mongoose.connection.db.dropDatabase();
});

afterEach(async () => {
    await User.deleteMany({});
    await Message.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
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
            message: "Hello, Bob!",
        };

        const message = await Message.create(messageData);

        expect(message).toBeDefined();
        expect(message.sender.toString()).toBe(sender._id.toString());
        expect(message.recipient.toString()).toBe(recipient._id.toString());
        expect(message.message).toBe("Hello, Bob!");
        expect(message.timestamp).toBeDefined();
    });

    it('should throw validation errors for missing fields', async () => {
        let error;

        try {
            await Message.create({});
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors.sender).toBeDefined();
        expect(error.errors.recipient).toBeDefined();
        expect(error.errors.message).toBeDefined();
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
            message: "Hello, Bob!",
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

        await Message.create({ sender: sender._id, recipient: recipient._id, message: "Hi Bob!" });
        await Message.create({ sender: recipient._id, recipient: sender._id, message: "Hi Alice!" });

        const messages = await Message.find({
            $or: [
                { sender: sender._id, recipient: recipient._id },
                { sender: recipient._id, recipient: sender._id },
            ],
        });

        expect(messages).toHaveLength(2);
        expect(messages[0].message).toBe("Hi Bob!");
        expect(messages[1].message).toBe("Hi Alice!");
    });
});
