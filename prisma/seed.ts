import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@coursemanagement.com' },
    update: {},
    create: {
      email: 'admin@coursemanagement.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create Instructor users
  const instructorPassword = await bcrypt.hash('Instructor123!', 12);

  const instructor1 = await prisma.user.upsert({
    where: { email: 'john.instructor@coursemanagement.com' },
    update: {},
    create: {
      email: 'john.instructor@coursemanagement.com',
      password: instructorPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.INSTRUCTOR,
      status: UserStatus.ACTIVE,
      bio: 'Experienced software developer with 10+ years in web development and cloud architecture.',
      phone: '+1234567890',
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'sarah.instructor@coursemanagement.com' },
    update: {},
    create: {
      email: 'sarah.instructor@coursemanagement.com',
      password: instructorPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.INSTRUCTOR,
      status: UserStatus.ACTIVE,
      bio: 'Data science expert specializing in machine learning and artificial intelligence.',
      phone: '+1234567891',
    },
  });

  console.log('✅ Created instructor users:', [instructor1.email, instructor2.email].join(', '));

  // Create Student users
  const studentPassword = await bcrypt.hash('Student123!', 12);

  const students = [
    {
      email: 'alice.student@coursemanagement.com',
      firstName: 'Alice',
      lastName: 'Wilson',
    },
    {
      email: 'bob.student@coursemanagement.com',
      firstName: 'Bob',
      lastName: 'Brown',
    },
    {
      email: 'charlie.student@coursemanagement.com',
      firstName: 'Charlie',
      lastName: 'Davis',
    },
  ];

  for (const student of students) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        ...student,
        password: studentPassword,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
      },
    });
  }

  console.log('✅ Created student users:', students.map(s => s.email).join(', '));

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Web Development' },
      update: {},
      create: {
        name: 'Web Development',
        description: 'Learn modern web development technologies and frameworks',
        color: '#3B82F6',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Data Science' },
      update: {},
      create: {
        name: 'Data Science',
        description: 'Explore data analysis, machine learning, and AI',
        color: '#10B981',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Mobile Development' },
      update: {},
      create: {
        name: 'Mobile Development',
        description: 'Build native and cross-platform mobile applications',
        color: '#F59E0B',
      },
    }),
    prisma.category.upsert({
      where: { name: 'DevOps' },
      update: {},
      create: {
        name: 'DevOps',
        description: 'Learn deployment, CI/CD, and infrastructure management',
        color: '#EF4444',
      },
    }),
  ]);

  console.log('✅ Created categories:', categories.map(c => c.name).join(', '));

  // Create Sample Courses
  const webDevCat = categories.find(c => c.name === 'Web Development')!;
  const dataScienceCat = categories.find(c => c.name === 'Data Science')!;
  const mobileDevCat = categories.find(c => c.name === 'Mobile Development')!;

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Complete Web Development Bootcamp',
        description: 'Learn HTML, CSS, JavaScript, React, Node.js, and more in this comprehensive web development course.',
        content: 'This course covers everything you need to become a full-stack web developer.',
        duration: 40,
        price: 89.99,
        maxStudents: 100,
        currentEnrollment: 0,
        status: 'PUBLISHED',
        instructorId: instructor1.id,
        categories: {
          create: {
            categoryId: webDevCat.id,
          },
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'Advanced React and TypeScript',
        description: 'Master React development with TypeScript, advanced patterns, and best practices.',
        content: 'Deep dive into React ecosystem with TypeScript and modern development patterns.',
        duration: 25,
        price: 129.99,
        maxStudents: 50,
        currentEnrollment: 0,
        status: 'PUBLISHED',
        instructorId: instructor1.id,
        categories: {
          create: {
            categoryId: webDevCat.id,
          },
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'Data Science Fundamentals',
        description: 'Introduction to data science, statistics, and machine learning basics.',
        content: 'Learn the fundamentals of data analysis and machine learning.',
        duration: 30,
        price: 99.99,
        maxStudents: 75,
        currentEnrollment: 0,
        status: 'PUBLISHED',
        instructorId: instructor2.id,
        categories: {
          create: {
            categoryId: dataScienceCat.id,
          },
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'Machine Learning with Python',
        description: 'Advanced machine learning concepts and practical implementations using Python.',
        content: 'Build and deploy machine learning models using Python and popular libraries.',
        duration: 35,
        price: 149.99,
        maxStudents: 40,
        currentEnrollment: 0,
        status: 'PUBLISHED',
        instructorId: instructor2.id,
        categories: {
          create: {
            categoryId: dataScienceCat.id,
          },
        },
      },
    }),
  ]);

  console.log('✅ Created sample courses:', courses.map(c => c.title).join(', '));

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Created Accounts:');
  console.log('Admin: admin@coursemanagement.com / Admin123!');
  console.log('Instructor 1: john.instructor@coursemanagement.com / Instructor123!');
  console.log('Instructor 2: sarah.instructor@coursemanagement.com / Instructor123!');
  console.log('Student 1: alice.student@coursemanagement.com / Student123!');
  console.log('Student 2: bob.student@coursemanagement.com / Student123!');
  console.log('Student 3: charlie.student@coursemanagement.com / Student123!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });