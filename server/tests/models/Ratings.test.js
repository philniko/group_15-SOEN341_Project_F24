
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Ratings from '../../models/Ratings.js';
import User from '../../models/User.js';
import Group from '../../models/Group.js';

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
  await Ratings.init();
  await User.init();
  await Group.init();
});

afterAll(async () => {
  // Close mongoose connection and stop the server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await Ratings.deleteMany({});
  await User.deleteMany({});
  await Group.deleteMany({});
});

afterEach(async () => {
  // Clear all collections after each test
  await Ratings.deleteMany({});
  await User.deleteMany({});
  await Group.deleteMany({});
});

describe('Ratings Model Tests', () => {
  it('should create a rating successfully', async () => {
    const rater = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: 'password123',
    });

    const ratee = await User.create({
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@example.com',
      password: 'password123',
    });

    const group = await Group.create({
      name: 'Team Alpha',
      instructor: rater._id,
    });

    const ratingData = {
      rater: rater._id,
      ratee: ratee._id,
      group: group._id,
      CooperationRating: 5,
      CooperationFeedback: 'Excellent team player.',
      ConceptualContributionRating: 4,
      ConceptualContributionFeedback: 'Great ideas.',
      PracticalContributionRating: 5,
      PracticalContributionFeedback: 'Very efficient.',
      WorkEthicRating: 4,
      WorkEthicFeedback: 'Hardworking and consistent.',
    };

    const rating = await Ratings.create(ratingData);

    expect(rating).toBeDefined();
    expect(rating.rater.toString()).toBe(rater._id.toString());
    expect(rating.ratee.toString()).toBe(ratee._id.toString());
    expect(rating.group.toString()).toBe(group._id.toString());
    expect(rating.CooperationRating).toBe(5);
    expect(rating.CooperationFeedback).toBe('Excellent team player.');
  });

  it('should throw an error for invalid rating values', async () => {
    const rater = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: 'password123',
    });

    const ratee = await User.create({
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@example.com',
      password: 'password123',
    });

    const group = await Group.create({
      name: 'Team Alpha',
      instructor: rater._id,
    });

    const ratingData = {
      rater: rater._id,
      ratee: ratee._id,
      group: group._id,
      CooperationRating: 6, // Invalid value
      CooperationFeedback: 'Invalid rating.',
      ConceptualContributionRating: 3,
      PracticalContributionRating: 4,
      WorkEthicRating: 2,
    };

    await expect(Ratings.create(ratingData)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('should create a rating without feedback fields', async () => {
    const rater = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: 'password123',
    });

    const ratee = await User.create({
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@example.com',
      password: 'password123',
    });

    const group = await Group.create({
      name: 'Team Alpha',
      instructor: rater._id,
    });

    const ratingData = {
      rater: rater._id,
      ratee: ratee._id,
      group: group._id,
      CooperationRating: 5,
      ConceptualContributionRating: 4,
      PracticalContributionRating: 5,
      WorkEthicRating: 3,
    };

    const rating = await Ratings.create(ratingData);

    expect(rating).toBeDefined();
    expect(rating.CooperationFeedback).toBeUndefined();
    expect(rating.ConceptualContributionFeedback).toBeUndefined();
  });

  it('should update feedback fields successfully', async () => {
    const rater = await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: 'password123',
    });

    const ratee = await User.create({
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@example.com',
      password: 'password123',
    });

    const group = await Group.create({
      name: 'Team Alpha',
      instructor: rater._id,
    });

    const rating = await Ratings.create({
      rater: rater._id,
      ratee: ratee._id,
      group: group._id,
      CooperationRating: 4,
      ConceptualContributionRating: 5,
      PracticalContributionRating: 3,
      WorkEthicRating: 5,
    });

    rating.CooperationFeedback = 'Great teamwork!';
    rating.WorkEthicFeedback = 'Needs improvement.';
    await rating.save();

    const updatedRating = await Ratings.findById(rating._id);

    expect(updatedRating.CooperationFeedback).toBe('Great teamwork!');
    expect(updatedRating.WorkEthicFeedback).toBe('Needs improvement.');
  });

  it('should enforce valid ObjectIds for relationships', async () => {
    const invalidData = {
      rater: 'invalidObjectId',
      ratee: 'invalidObjectId',
      group: 'invalidObjectId',
      CooperationRating: 5,
      ConceptualContributionRating: 4,
      PracticalContributionRating: 3,
      WorkEthicRating: 5,
    };

    await expect(Ratings.create(invalidData)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });
});