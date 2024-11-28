// tests/models/Course.test.js

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
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
  await Course.init();
});

afterAll(async () => {
  // Close mongoose connection and stop the server
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the Course collection before each test
  await Course.deleteMany({});
});

afterEach(async () => {
  // Clear the Course collection after each test
  await Course.deleteMany({});
});

describe('Course Model Tests', () => {
  it('should create a course successfully', async () => {
    const courseData = {
      name: 'Introduction to Algorithms',
      description: 'A foundational course in algorithms and data structures.',
    };

    const course = await Course.create(courseData);

    expect(course).toBeDefined();
    expect(course.name).toBe(courseData.name);
    expect(course.description).toBe(courseData.description);
    expect(course.createdAt).toBeDefined();
  });

  it('should set createdAt to the current date by default', async () => {
    const courseData = {
      name: 'Operating Systems',
      description: 'A study of modern operating systems.',
    };

    const course = await Course.create(courseData);

    expect(course.createdAt).toBeDefined();
    expect(new Date(course.createdAt).toDateString()).toBe(new Date().toDateString());
  });

  it('should fetch a course by ID', async () => {
    const courseData = {
      name: 'Linear Algebra',
      description: 'A course on linear equations and matrices.',
    };

    const course = await Course.create(courseData);
    const fetchedCourse = await Course.findById(course._id);

    expect(fetchedCourse).toBeDefined();
    expect(fetchedCourse.name).toBe(courseData.name);
    expect(fetchedCourse.description).toBe(courseData.description);
  });

  it('should update a course successfully', async () => {
    const courseData = {
      name: 'Physics I',
      description: 'An introduction to classical mechanics.',
    };

    const course = await Course.create(courseData);

    course.name = 'Physics II';
    course.description = 'A continuation of classical mechanics and thermodynamics.';
    await course.save();

    const updatedCourse = await Course.findById(course._id);

    expect(updatedCourse.name).toBe('Physics II');
    expect(updatedCourse.description).toBe('A continuation of classical mechanics and thermodynamics.');
  });

  it('should delete a course successfully', async () => {
    const courseData = {
      name: 'Database Systems',
      description: 'A study of relational database management systems.',
    };

    const course = await Course.create(courseData);
    await course.deleteOne();

    const deletedCourse = await Course.findById(course._id);

    expect(deletedCourse).toBeNull();
  });
});
