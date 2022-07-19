import { AuthGuard } from '@nestjs/passport';

export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    // Override handleRequest so no error is thrown
    override handleRequest(_, user, __, ___) {
        return user;
    }
}
