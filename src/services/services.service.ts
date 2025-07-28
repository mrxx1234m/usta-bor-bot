import { Injectable } from '@nestjs/common';

@Injectable()
export class ServicesService {
    async getAllServices(){
        const servicesCatalog = {
            "Qurilish va Ta'mirlash": [
              "G'isht urish",
              "Shtukaturka (shpaklyovka)",
              "Pol taxta (laminat, linoleum, parket)",
              "Gipsokarton ishlari",
              "Ship suvoq qilish",
              "Santexnik xizmatlar",
              "Elektrik xizmatlari",
              "Kafel-plitka yotqizish",
              "Shtrob (teshik va kesish ishlari)",
              "Beton quyish, poydevor",
              "Burchatka yotqizish (tosh terish)"
            ],
            "Usta xizmatlari": [
              "Duradigor",
              "Tunukasoz",
              "Zinasoz",
              "Malyar",
              "Oboy yopish",
              "Fortochka ochish",
              "Konditsioner o'rnatish"
            ],
            "Santexnika xizmatlari": [
              "Truba, unitaz, kran ishlari",
              "Kanalizatsiya ishlari"
            ],
            "Elektrik xizmatlari": [
              "Lyustra, svet, avtomat o'rnatish",
              "Sim tortish, rozeta almashtirish"
            ],
            "Beton va kesish ishlari": [
              "Beton teshish/kesish",
              "Asfalt, shtyashka kesish"
            ],
            "Kamera va xavfsizlik tizimlari": [
              "Kamera o'rnatish",
              "Domofon o'rnatish",
              "Signalizatsiya tizimi"
            ],
            "Eshik va rom xizmatlari": [
              "Temir eshik, plastik rom",
              "Deraza sozlash, fortochka ochish"
            ],
            "Yoritish va bezak ishlari": [
              "Dekorativ yoritish",
              "LED tasma, podsvetka",
              "Gipsli bezaklar"
            ],
            "Bo'yash va bezak ishlari": [
              "Emulsiya, alyuminiy bo'yash",
              "Dekorativ suvoq"
            ],
            "Tozalash xizmatlari": [
              "Uy/ofis tozalash",
              "Qurilishdan keyingi tozalash",
              "Oyna yuvish"
            ],
            "Bog' va tashqi ishlar": [
              "Maysa o'rish",
              "Daraxt kesish",
              "Suv purkagich o'rnatish",
              "Panjara, devor qurish"
            ],
            "Mardikorchilik": [
              "Yuk tushurish/chiqarish",
              "Beton aralashtirish",
              "Qurilishda yordamchi",
              "Tozalashda yordam",
              "Og'ir ishchi kuchi (soatbay/kunlik)"
            ]
          };
          
        return servicesCatalog

    }
}
