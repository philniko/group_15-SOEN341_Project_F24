    import mongoose from 'mongoose';
    import Group from '../../models/Group';
    import User from '../../models/User';
    import Ratings from '../../models/Ratings';
    import Course from '../../models/Course';

    beforeAll(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/testdb');
    });
    
    beforeEach(async () => {
        await User.deleteMany({});
        await Group.deleteMany({});
        await Course.deleteMany({});
        await mongoose.connection.db.dropDatabase();

    });
    
    afterEach(async () => {
        await User.deleteMany({});
        await Group.deleteMany({});
        await Course.deleteMany({});
    });
    
    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Group Model Tests', () => {
        it('should create a group successfully', async () => {
            const instructor = await User.create({ firstName: 'John', lastName: 'Doe', email: `john.doe+${Date.now()}@example.com`, password: 'password123' });

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

            let error;
            try {
                await Group.create(groupData);
            } catch (e) {
                error = e;
            }

            expect(error).toBeDefined();
            expect(error.errors.instructor).toBeDefined();
        });

        it('should reference valid ObjectIds', async () => {
            const invalidId = '1234';

            let error;
            try {
                await Group.create({ name: 'Team Beta', instructor: invalidId });
            } catch (e) {
                error = e;
            }

            expect(error).toBeDefined();
            expect(error.errors.instructor).toBeDefined();
        });

        
        it('should add messages to the group', async () => {
            const instructor = await User.create({ firstName: 'Jane', lastName: 'Doe', email: `jane.doe+${Date.now()}@example.com`, password: 'password123' });

            const group = await Group.create({ name: 'Team Gamma', instructor: instructor._id });

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
            const instructor = await User.create({ firstName: 'Jane', lastName: 'Doe', email: `jane.doe+${Date.now()}@example.com`, password: 'password123' });
            const student = await User.create({ firstName: 'Bob', lastName: 'Brown', email: `bob.brown+${Date.now()}@example.com`, password: 'password123' });

            const group = await Group.create({ name: 'Team Echo', instructor: instructor._id });

            group.students.push(student._id);
            group.students.push(student._id);

            // Deduplicate before saving
            group.students = [...new Set(group.students.map(id => id.toString()))];
            await group.save();

            const updatedGroup = await Group.findById(group._id);
            expect(updatedGroup.students).toHaveLength(1);
        });

        it('should fetch groups by instructor', async () => {
            const instructor = await User.create({ 
                firstName: 'Jane', 
                lastName: 'Doe', 
                email: `jane.doe+${Date.now()}@example.com`, 
                password: 'password123' 
            });
        
            await Group.create({ name: 'Team Zeta', instructor: instructor._id });
            await Group.create({ name: 'Team Eta', instructor: instructor._id });
        
            const groups = await Group.find({ instructor: instructor._id });
        
            expect(groups).toHaveLength(2);
            expect(groups[0].name).toBe('Team Zeta');
            expect(groups[1].name).toBe('Team Eta');
        });
        

    });
