import { Module } from "@nestjs/common";
import { FixtureService } from "./fixture.service";
import { FixtureController } from "./fixture.controller";

@Module({
  controllers: [FixtureController],
  providers: [FixtureService],
  exports: [FixtureService],
})
export class FixtureModule {}
