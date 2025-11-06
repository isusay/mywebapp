import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CategoryService {
  static async getAllCategories() {
    const categories = await prisma.category.findMany({
      include: {
        courses: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      courseCount: category.courses.length,
    }));
  }

  static async getCategoryById(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        courses: {
          where: {
            status: 'PUBLISHED',
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
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      courses: category.courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        duration: course.duration,
        price: course.price,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        createdAt: course.createdAt,
      })),
    };
  }

  static async createCategory(categoryData: { name: string; description?: string; color?: string }) {
    const { name, description, color } = categoryData;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
      },
    });

    return category;
  }

  static async updateCategory(categoryId: string, categoryData: { name?: string; description?: string; color?: string }) {
    const { name, description, color } = categoryData;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description,
        color,
      },
    });

    return category;
  }

  static async deleteCategory(categoryId: string) {
    // Check if category has courses
    const courseCount = await prisma.courseCategory.count({
      where: { categoryId },
    });

    if (courseCount > 0) {
      throw new Error('Cannot delete category with associated courses');
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return { message: 'Category deleted successfully' };
  }
}