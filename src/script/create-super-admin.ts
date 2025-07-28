import { PrismaService } from "src/prisma/prisma.service"
import * as bcrypt from 'bcrypt'
 const createSuperAdmin = async ()=>{
    const prisma = new PrismaService()
    const oldSuperAdmin = await prisma.admin.findMany({where:{userName:'superadmin@gmail.com'}})
    if(!oldSuperAdmin[0]){
        const password = await bcrypt.hash('12345678',10)
        await prisma.admin.create({data:{userName:'superadmin@gmail.com',password:password}})
    
    }
   
    
}
export default createSuperAdmin

