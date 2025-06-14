import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppClient1748346097084 implements MigrationInterface {
  name = 'AppClient1748346097084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "app_clients" ("id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL, "created_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIME WITH TIME ZONE NOT NULL DEFAULT now(), "enable" boolean NOT NULL DEFAULT true, "deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, "clientId" character varying NOT NULL, "clientSecret" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_c0bfec6a4b273cd34060164f6ff" UNIQUE ("clientId"), CONSTRAINT "PK_f61116c55387886fdb83aef8312" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "app_clients"`);
  }
}
