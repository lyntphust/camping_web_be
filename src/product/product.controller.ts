import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Permission } from 'src/role/decorators/permission.decorator';

import { PermissionGuard } from 'src/role/guards/permission.guard';

import { ProductService } from './product.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';
import { BadRequestException } from '@nestjs/common';

@Controller('product')
@ApiTags('Product')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  @Public()
  async findAll() {
    return this.productService.findAll();
  }

  @Get('category/:category')
  @Public()
  async findAllByCategory(@Param('category') category: string) {
    return this.productService.findAllByCategory(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  // @Permission('CRUD_PRODUCT_ALL')
  // @UseGuards(PermissionGuard)\
  @Public()
  @UseInterceptors(FilesInterceptor('file', 1))
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        description: { type: 'string' },
        discount: { type: 'number' },
        price: { type: 'number' },
        category: { type: 'string' },
        variants: {
          type: 'string',
          description: 'JSON string representing product variants',
          example:
            '[{"color":"Red","size":"M","quantity":10},{"color":"Red","size":"S","quantity":11}]',
        },
      },
    },
  })
  async create(
    @Body() body: any, // Temporarily accept raw data
    @UploadedFiles() files: Express.Multer.File,
  ) {
    try {
      // Parse the JSON string in `variants` field
      const parsedVariants = JSON.parse(body.variants);

      // Construct the final DTO
      const createProductDto: CreateProductDto = {
        ...body,
        variants: parsedVariants, // Attach parsed variants
      };

      return this.productService.create(createProductDto,files);
    } catch (error) {
      throw new BadRequestException('Invalid JSON format in variants field');
    }
  }


  // @Permission('CRUD_PRODUCT_ALL')
  // @UseGuards(PermissionGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(+id, updateProductDto);
  }

  // @Permission('CRUD_PRODUCT_ALL')
  // @UseGuards(PermissionGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}
