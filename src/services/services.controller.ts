import { Controller } from '@nestjs/common';

@Controller('services')
export class ServicesController {
    async getAllServices(){
        const services = ['Santexnik', 'Elektrik', 'Bo‘yoqchi', 'Payvandchi'];
        return services

    }
}
