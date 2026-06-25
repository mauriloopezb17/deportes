import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    await this.syncPostgresSequences();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async syncPostgresSequences() {
    if (!process.env.DATABASE_URL?.startsWith("postgresql://")) {
      return;
    }

    await this.$executeRawUnsafe(`
      DO $$
      DECLARE
        rec record;
      BEGIN
        FOR rec IN
          SELECT
            quote_ident(table_schema) || '.' || quote_ident(table_name) AS table_name,
            quote_ident(column_name) AS column_name,
            pg_get_serial_sequence(
              quote_ident(table_schema) || '.' || quote_ident(table_name),
              column_name
            ) AS sequence_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND column_default LIKE 'nextval(%'
        LOOP
          EXECUTE format(
            'SELECT setval(%L, COALESCE((SELECT MAX(%s) FROM %s), 0) + 1, false)',
            rec.sequence_name,
            rec.column_name,
            rec.table_name
          );
        END LOOP;
      END $$;
    `);
  }
}
