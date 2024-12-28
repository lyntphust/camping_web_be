import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';

import { Order } from './entities/order.entity';
import { OrdersProducts } from './entities/orders-products.entity';
import { CreateOrderDto, ProductDto } from './dto/create-order.dto';
import { ProductService } from '../product/product.service';
import { UserService } from '../user/user.service';
import { Status } from './enums/status.enum';
import { ProductVariant } from 'src/product/entities/product-variant.entity';
import { S3CoreService } from 'src/s3/src';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrdersProducts)
    private readonly ordersProductsRepository: Repository<OrdersProducts>,

    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectStripe() private readonly stripeClient: Stripe,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly s3Service: S3CoreService,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { address, phone, products } = createOrderDto;

    let orderPrice = 0;

    // Validate products and stock using productVariantRepository
    const validatedProducts = await Promise.all(
      products.map(async (product: ProductDto) => {
        // Find product variant using productVariantRepository
        const existingVariant = await this.productVariantRepository.findOne({
          where: { id: product.id },
          relations: ['product'],
        });

        if (!existingVariant) {
          throw new NotFoundException(
            `Product variant with ID ${product.id} not found`,
          );
        }

        if (existingVariant.stock < product.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product variant: ${existingVariant.size} / ${existingVariant.color}`,
          );
        }

        // Deduct stock and update the product variant
        existingVariant.stock -= product.quantity;
        existingVariant.sold += product.quantity;
        await this.productVariantRepository.save(existingVariant);

        orderPrice +=
          (product.quantity *
            existingVariant.price *
            (100 - existingVariant.product.discount)) /
            100;

        return {
          productVariant: existingVariant,
          quantity: product.quantity,
          price: existingVariant.price,
        };
      }),
    );

    const savedOrder = await this.orderRepository.save({
      price: orderPrice + 50000,
      address,
      phone,
      status: 'CREATED',
      userId: userId,
    });
    console.log(savedOrder);
    // Create relationships between order and product variants
    for (const item of validatedProducts) {
      await this.ordersProductsRepository.save({
        order: savedOrder,
        productVariant: item.productVariant,
        quantity: item.quantity,
        price: item.price,
      });
    }

    return savedOrder;
  }

  /**
   * Get all orders of a specific user.
   * @param userId User ID
   */
  async getUserOrders(userId: number) {
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: [
        'OrdersProducts',
        'OrdersProducts.productVariant',
        'OrdersProducts.productVariant.product',
      ],
    });

    if (orders.length === 0) {
      throw new NotFoundException('No orders found for this user.');
    }
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
      const updatedOrderProducts = await Promise.all(
        order.OrdersProducts.map(async (orderProduct) => {
        const photoKey = orderProduct.productVariant.product.photo;
        let productImage = null;

        // Only fetch the image link if a photo key exists
        if (photoKey) {
          productImage = await this.s3Service.getLinkFromS3(photoKey);
        }

        return {
          ...orderProduct,
          image: productImage,
        };
        }),
      );

      return {
        ...order,
        OrdersProducts: updatedOrderProducts,
      };
      }),
    );

    return updatedOrders;
  }

  /**
   * Get all orders of a specific user.
   */
  async getAllOrders() {
    const orders = await this.orderRepository.find({
      relations: [
        'OrdersProducts',
        'OrdersProducts.productVariant',
        'OrdersProducts.productVariant.product',
      ],
    });
    if (orders.length === 0) {
      throw new NotFoundException('No orders found for this user.');
    }

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        const firstPhotoKey =
          order.OrdersProducts[0]?.productVariant?.product?.photo;
        let orderImage = null;
        console.log('aaaa: ', firstPhotoKey);
        // Only fetch the image link if a photo key exists
        if (firstPhotoKey) {
          orderImage = await this.s3Service.getLinkFromS3(firstPhotoKey);
        }

        return {
          ...order,
          image: orderImage,
        };
      }),
    );

    return updatedOrders;
  }

  /**
   * Update the status of an order (Admin only).
   * @param orderId Order ID
   * @param status New status
   */
  async updateOrderStatus(orderId: number, status: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }
    console.log(status);
    order.status = status;
    return await this.orderRepository.save(order);
  }

  async findAll() {
    const orders = await this.orderRepository.find();
    return orders;
  }

  async findAllByUserId(userId: number) {
    const orders = await this.orderRepository.find({
      where: { user: userId },
    });

    if (!orders.length) {
      throw new NotFoundException(`This user doesn't have any orders`);
    }

    return orders;
  }

  async findOne(orderId: number) {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} doesn't exist`);
    }

    return order;
  }
}
