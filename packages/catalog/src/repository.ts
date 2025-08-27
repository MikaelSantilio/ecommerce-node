import prisma from './database';
import { generateSlug, CategoryData, ProductData } from './utils';

export class CategoryRepository {
  static async create(name: string): Promise<CategoryData> {
    const slug = generateSlug(name);
    return await prisma.category.create({
      data: { name, slug },
    });
  }

  static async findById(id: string): Promise<CategoryData | null> {
    return await prisma.category.findUnique({
      where: { id },
    });
  }

  static async findBySlug(slug: string): Promise<CategoryData | null> {
    return await prisma.category.findUnique({
      where: { slug },
    });
  }

  static async findMany(options: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<{ items: CategoryData[]; total: number }> {
    const { skip, take, search } = options;

    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.count({ where }),
    ]);

    return { items, total };
  }

  static async update(id: string, name: string): Promise<CategoryData> {
    const slug = generateSlug(name);
    return await prisma.category.update({
      where: { id },
      data: { name, slug },
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }

  static async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: { categoryId: id },
    });
    return count > 0;
  }
}

// Product operations
export class ProductRepository {
  static async create(data: {
    name: string;
    description?: string;
    price: number;
    currency: string;
    stock: number;
    categoryId: string;
  }): Promise<ProductData> {
    const slug = generateSlug(data.name);
    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        description: data.description || null,
      },
    });

    return {
      ...product,
      price: Number(product.price),
    };
  }

  static async findById(id: string): Promise<ProductData | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) return null;

    return {
      ...product,
      price: Number(product.price),
    };
  }

  static async findBySlug(slug: string): Promise<ProductData | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) return null;

    return {
      ...product,
      price: Number(product.price),
    };
  }

  static async findMany(options: {
    skip: number;
    take: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ items: ProductData[]; total: number }> {
    const { skip, take, search, categoryId, minPrice, maxPrice } = options;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Convert Decimal prices to numbers
    const convertedItems = items.map(item => ({
      ...item,
      price: Number(item.price),
    }));

    return { items: convertedItems, total };
  }

  static async update(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    currency: string;
    stock: number;
    categoryId: string;
  }>): Promise<ProductData> {
    const updateData: any = { ...data };

    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return {
      ...product,
      price: Number(product.price),
    };
  }

  static async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  static async categoryExists(categoryId: string): Promise<boolean> {
    const count = await prisma.category.count({
      where: { id: categoryId },
    });
    return count > 0;
  }
}
