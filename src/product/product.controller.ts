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
import { ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';

@Controller('product')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
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
  @UseInterceptors(FilesInterceptor('file', 1))
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
        color: {
          type: 'string',
        },
        discount: {
          type: 'number',
        },
        price: {
          type: 'number',
        },
        description: {
          type: 'string',
        },
        size: {
          type: 'string',
        },
        category: {
          type: 'string',
        },
      },
    },
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() file: Express.Multer.File,
  ) {
    return this.productService.create(createProductDto, file);
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
