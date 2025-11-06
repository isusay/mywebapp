import { PrismaClient } from '@prisma/client';
import { CourseCreateInput, CourseUpdateInput, CourseResponse, PaginatedResponse } from '@/types';

const prisma = new PrismaClient();

export class CourseService {
  static async createCourse(courseData: CourseCreateInput, instructorId: string) {
    const { title, description, content, duration, price, maxStudents, thumbnail, categoryIds } = courseData;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        content,
        duration,
        price: price || 0,
        maxStudents: maxStudents || 50,
        thumbnail,
        instructorId,
        status: 'DRAFT',
        categories: categoryIds ? {
          create: categoryIds.map(categoryId => ({
            categoryId,
          })),
        } : undefined,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.formatCourseResponse(course);
  }

  static async getAllCourses(page: number = 1, limit: number = 10, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.course.count({ where }),
    ]);

    const formattedCourses = courses.map(course => this.formatCourseResponse(course));

    return {
      success: true,
      message: 'Courses retrieved successfully',
      data: formattedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCourseById(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            status: true,
            enrolledAt: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    return this.formatCourseResponse(course);
  }

  static async updateCourse(courseId: string, courseData: CourseUpdateInput, instructorId: string) {
    const { title, description, content, duration, price, maxStudents, thumbnail, status, categoryIds } = courseData;

    // Check if course exists and user is the instructor
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw new Error('Course not found');
    }

    if (existingCourse.instructorId !== instructorId) {
      throw new Error('You are not authorized to update this course');
    }

    // Update categories if provided
    if (categoryIds) {
      // Remove existing categories
      await prisma.courseCategory.deleteMany({
        where: { courseId },
      });

      // Add new categories
      await prisma.courseCategory.createMany({
        data: categoryIds.map(categoryId => ({
          courseId,
          categoryId,
        })),
      });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        content,
        duration,
        price,
        maxStudents,
        thumbnail,
        status,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return this.formatCourseResponse(course);
  }

  static async deleteCourse(courseId: string, userId: string, userRole: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Check authorization: only course instructor or admin can delete
    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new Error('You are not authorized to delete this course');
    }

    // Check if there are active enrollments
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        courseId,
        status: 'ENROLLED',
      },
    });

    if (activeEnrollments > 0) {
      throw new Error('Cannot delete course with active enrollments');
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: 'Course deleted successfully' };
  }

  static async getInstructorCourses(instructorId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId },
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.course.count({ where: { instructorId } }),
    ]);

    const formattedCourses = courses.map(course => ({
      ...this.formatCourseResponse(course),
      enrollmentStats: {
        total: course.enrollments.length,
        active: course.enrollments.filter(e => e.status === 'ENROLLED').length,
        completed: course.enrollments.filter(e => e.status === 'COMPLETED').length,
      },
    }));

    return {
      success: true,
      message: 'Instructor courses retrieved successfully',
      data: formattedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private static formatCourseResponse(course: any): CourseResponse {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      content: course.content,
      duration: course.duration,
      price: course.price,
      maxStudents: course.maxStudents,
      currentEnrollment: course.currentEnrollment,
      status: course.status,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      categories: course.categories?.map((cc: any) => ({
        id: cc.category.id,
        name: cc.category.name,
        color: cc.category.color,
      })) || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}