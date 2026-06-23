import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API del microservicio de Deportistas e Inscripciones';
  }
}
