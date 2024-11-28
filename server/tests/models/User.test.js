    import mongoose from 'mongoose';
    import User from '../../models/User.js';
    import bcrypt from 'bcrypt';
    import jwt from 'jsonwebtoken';

    beforeAll(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/testdb');
        await User.syncIndexes();
    });

    beforeEach(async () => {
        await User.deleteMany(); 
        await mongoose.connection.db.dropDatabase();
    });

    afterEach(async () => {
        await User.deleteMany(); 
    });

    afterAll(async () => {
        await mongoose.connection.close();
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
        
        // it('should enforce unique email constraint', async () => {
        //     const userData = {
        //         firstName: 'John',
        //         lastName: 'Doe',
        //         email: 'john.doe@example.com',
        //         password: 'password123',
        //     };
        
        //     const user1 = new User(userData);
        //     await user1.save();
        
        //     const user2 = new User(userData);
        
        //     let error;
        //     try {
        //         await user2.save();
        //     } catch (e) {
        //         error = e;
        //     }
        
        //     expect(error).toBeDefined();
        // });

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
        
            // Create and save the user
            const user = new User(userData);
            await user.save();
        
            // Simulate the JWT generation logic
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
        
            // Verify the token
            const decoded = jwt.verify(token, 'secret');
        
            // Assert the decoded token's structure
            expect(decoded).toBeDefined();
            expect(decoded.id).toBe(user._id.toString()); 
            expect(decoded.firstName).toBe(user.firstName);
            expect(decoded.lastName).toBe(user.lastName);
            expect(decoded.email).toBe(user.email);
            expect(decoded.role).toBe(user.role);
        });
        
    });
