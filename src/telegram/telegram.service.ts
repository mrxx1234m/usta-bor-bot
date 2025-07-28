import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServicesService } from 'src/services/services.service';
import { Markup, Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID || '-1001234567890';

  constructor(private readonly services: ServicesService) {
    this.bot = new Telegraf(process.env.BOT_TOKEN || '');
  }

  async onModuleInit() {
    const serviceList = await this.services.getAllServices();

    /** START komandasi */
    this.bot.start((ctx) => {
      ctx.reply(
        `Assalomu alaykum! 👋
"Ustabor" xizmat ko‘rsatish platformasiga xush kelibsiz!

✅ Bu yerda siz:
— Ishonchli ustalarni topishingiz,
— Yoki xizmat ko‘rsatib daromad topishingiz mumkin.

Quyidagilardan birini tanlang:
🔹 Usta – Men xizmat ko‘rsatmoqchiman
🔹 Mijoz – Menga usta kerak
🔹 ℹ️ Bot haqida – Platforma haqida batafsil`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🔧 Menga usta kerak', 'user')],
          [Markup.button.callback("🛠 Men xizmat ko‘rsatmoqchiman", 'master')],
          [Markup.button.callback('ℹ️ Bot haqida batafsil', 'info')],
        ])
      );
    });

    /** Mijoz tugmasi bosilganda — kategoriyalar chiqadi */
    this.bot.action('user', async (ctx) => {
      const categories = Object.keys(serviceList);
      await ctx.editMessageText(
        'Qaysi turdagi xizmat kerak?',
        Markup.inlineKeyboard(
          categories.map((category) => [
            Markup.button.callback(category, `category_${category}`),
          ])
        )
      );
    });

    /** Har bir kategoriya uchun xizmatlar chiqishi */
    Object.keys(serviceList).forEach((category) => {
      this.bot.action(`category_${category}`, async (ctx) => {
        const services = serviceList[category];
        await ctx.editMessageText(
          `Tanlangan kategoriya: ${category}\nXizmatni tanlang:\n\n📞 Admin: @azez_coder`,
          Markup.inlineKeyboard(
            services.map((service) => [
              Markup.button.callback(service, `service_${service}`),
            ])
          )
        );
      });
    });

    /** Xizmat tanlanganda tasdiq + kanalga xabar yuborish */
    Object.entries(serviceList).forEach(([category, services]) => {
      services.forEach((service) => {
        this.bot.action(`service_${service}`, async (ctx) => {
          const user = ctx.from;
          const message = `
🆕 Yangi BUYURTMA!

📌 Kategoriya: ${category}
🔧 Xizmat: ${service}
👤 Foydalanuvchi: ${user.first_name || ''} ${user.last_name || ''}
📱 Username: @${user.username || 'yo‘q'}
🆔 User ID: ${user.id}
          `;

          try {
            await ctx.reply(
              `✅ Siz "${service}" xizmatini tanladingiz. Tez orada siz bilan bog'lanamiz!\n\n📞 Admin bilan bog'lanish: @azez_coder`
            );

            await this.bot.telegram.sendMessage(this.ADMIN_CHANNEL_ID, message);
          } catch (error) {
            console.error('❌ Kanalga yuborishda xato:', error);
          }
        });
      });
    });

    /** Usta bo‘lish tugmasi bosilganda */
    this.bot.action('master', async (ctx) => {
      await ctx.reply(`Ajoyib! Siz xizmat ko‘rsatmoqchisiz.

📌 Ma'lumotlarni quyidagi formatda yozib yuboring:
1. Xizmat turi (masalan: santexnik, bo‘yash, elektrik)
2. Ismingiz
3. Telefon raqamingiz

✅ Ma'lumotlaringiz admin tomonidan tekshiriladi.

📞 Admin: @azez_coder
      `);
    });

    /** Usta tomonidan yozilgan textni qabul qilish */
    this.bot.on('text', async (ctx) => {
      const user = ctx.from;
      const text = ctx.message.text;

      // Faqat usta ma’lumotlarini kanalga yuborish (agar "usta" rejimi bo‘lsa, state kerak bo‘ladi, hozir oddiy qilib qilyapmiz)
      if (
        text.includes('Ism') ||
        text.includes('Tel') ||
        text.includes('Xizmat') ||
        text.length > 10
      ) {
        const message = `
🆕 Yangi USTA ARIZASI!

📌 Ma'lumotlar:
${text}

👤 Ismi: ${user.first_name || ''} ${user.last_name || ''}
📱 Username: @${user.username || 'yo‘q'}
🆔 User ID: ${user.id}
        `;

        try {
          await ctx.reply('✅ Rahmat! Ma’lumotlaringiz qabul qilindi. Admin tez orada siz bilan bog‘lanadi.');
          await this.bot.telegram.sendMessage(this.ADMIN_CHANNEL_ID, message);
        } catch (error) {
          console.error('❌ Usta ma’lumotini kanalga yuborishda xato:', error);
        }
      }
    });

    /** Bot haqida */
    this.bot.action('info', (ctx) =>
      ctx.reply(
        `ℹ️ "Ustabor" nima?

✅ Ustabor – bu ishonchli ustalar va mijozlarni bog‘laydigan platforma.
Bu yerda siz:
— O‘zingiz uchun eng yaxshi usta topasiz.
— O‘zingizning xizmatlaringizni taklif qilib daromad olasiz.

🔐 Xavfsizlik:
— Har bir usta admin tomonidan tasdiqlanadi.
— Sizning ma'lumotlaringiz himoyalangan.

🚀 Maqsadimiz: xizmatlarni tez, oson va ishonchli qilib ulash!

ADMIN @azez_coder
DASTURCHI @azez_coder
`
      )
    );

    /** Botni ishga tushirish */
    await this.bot.launch();
    console.log('✅ Bot ishga tushdi');
  }
}
