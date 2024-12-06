import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../role/entities/role.entity';
export type AuthPayload = {
  id: number;
  email: string;
  role: Role;
};
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
