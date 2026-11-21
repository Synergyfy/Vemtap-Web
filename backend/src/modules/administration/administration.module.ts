import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrationService } from './administration.service';
import { AdministrationController } from './administration.controller';
import { ImpersonationToken } from './entities/impersonation-token.entity';
import { CustomerImpersonationToken } from './entities/customer-impersonation-token.entity';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Business } from '../businesses/entities/business.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Cluster } from '../clusters/entities/cluster.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { VerificationCheck } from '../verification/entities/verification-check.entity';
import { Visit } from '../visitors/entities/visit.entity';
import { Contact } from '../contacts/entities/contact.entity';
import { BusinessCustomerNote } from '../business-customers/entities/business-customer-note.entity';
import { AuditInterceptor } from './audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImpersonationToken,
      CustomerImpersonationToken,
      AuditLog,
      User,
      UserSession,
      Branch,
      Business,
      Payment,
      Cluster,
      Subscription,
      VerificationCheck,
      Visit,
      Contact,
      BusinessCustomerNote,
    ]),
  ],
  controllers: [AdministrationController],
  providers: [
    AdministrationService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AdministrationService],
})
export class AdministrationModule {}
